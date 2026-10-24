import json,re
from pathlib import Path
from graphify.cache import save_semantic_cache
p=Path('graphify-out');root=Path('.').resolve()
chunks=json.loads((p/'.graphify_chunks.json').read_text())
ast=json.loads((p/'.graphify_ast.json').read_text())
ast_ids={n['id'] for n in ast['nodes']}
results=[];coverage={}
for number,files in enumerate(chunks,1):
    path=p/f'.graphify_result_{number:02}.json'
    d=json.loads(path.read_text())
    assert isinstance(d,dict) and isinstance(d.get('nodes'),list) and isinstance(d.get('edges'),list),number
    assert isinstance(d.get('hyperedges',[]),list),number
    own={n['id'] for n in d['nodes']}
    for node in d['nodes']:
        assert re.fullmatch('[a-z0-9_]+',node['id']),node
        assert node['source_file'] in files,(number,node['source_file'])
        assert node['file_type'] in ['code','document','paper','image','rationale','concept'],node
    for edge in d['edges']:
        assert edge['source'] in own|ast_ids and edge['target'] in own|ast_ids,(number,edge)
        assert edge['source_file'] in files,edge
        assert 'confidence_score' in edge,edge
        assert edge['confidence']!='EXTRACTED' or edge['confidence_score']==1.0,edge
    coverage.update(d.get('coverage') or {})
    # Collaboration tool does not expose token usage; never substitute invented counts.
    d['usage_available']=False
    results.append((number,d))
# Persist trusted chunk numbers only after the whole set passes validation.
for number,d in results:
    path=p/f'.graphify_chunk_{number:02}.json'
    path.write_text(json.dumps(d,ensure_ascii=False,indent=2))
    assert json.loads(path.read_text())['nodes']==d['nodes']
partial=[]
for files in chunks:
    for src in files:
        if Path(src).suffix.lower() in ['.png','.jpg','.jpeg','.webp','.gif']:continue
        total=sum(1 for _ in Path(src).open(encoding='utf-8',errors='replace'))
        n=coverage.get(src)
        if n is None or int(n)<total:partial.append(src)
(p/'.graphify_partial.txt').write_text('\n'.join(partial))
new={'nodes':[],'edges':[],'hyperedges':[],'input_tokens':0,'output_tokens':0,'usage_available':False}
for _,d in results:
    for kind in ['nodes','edges','hyperedges']:new[kind].extend(d.get(kind,[]))
(p/'.graphify_semantic_new.json').write_text(json.dumps(new,ensure_ascii=False))
uncached=(p/'.graphify_uncached.txt').read_text().splitlines()
saved=save_semantic_cache(new['nodes'],new['edges'],new['hyperedges'],root=str(root),allowed_source_files=uncached,prompt_file='/home/johnny/.codex/skills/graphify/references/extraction-spec.md',partial_source_files=partial)
cached=json.loads((p/'.graphify_cached.json').read_text()) if (p/'.graphify_cached.json').exists() else {'nodes':[],'edges':[],'hyperedges':[]}
seen=set();semantic={**new,'nodes':[],'edges':cached['edges']+new['edges'],'hyperedges':cached.get('hyperedges',[])+new['hyperedges']}
for node in cached['nodes']+new['nodes']:
    if node['id'] not in seen:semantic['nodes'].append(node);seen.add(node['id'])
for kind in ['nodes','edges']:
    for item in semantic[kind]:item['_origin']='semantic'
(p/'.graphify_semantic.json').write_text(json.dumps(semantic,ensure_ascii=False))
merged={**semantic,'nodes':ast['nodes']+[n for n in semantic['nodes'] if n['id'] not in ast_ids],'edges':ast['edges']+semantic['edges']}
(p/'.graphify_extract.json').write_text(json.dumps(merged,ensure_ascii=False))
print(f'Validated {len(results)} chunks; cached {saved} files; partial: {partial}')
print(f'Merged {len(merged["nodes"])} nodes and {len(merged["edges"])} edges ({len(ast["nodes"])} AST + {len(semantic["nodes"])} semantic)')
print('Semantic token usage: not exposed by collaboration tools (unmetered, not zero).')
