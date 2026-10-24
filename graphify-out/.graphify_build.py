import json
from pathlib import Path
from graphify.build import build_from_json
from graphify.cluster import cluster,score_all
from graphify.analyze import god_nodes,surprising_connections,suggest_questions
from graphify.report import generate
from graphify.export import to_json
from graphify.diagnostics import diagnose_extraction,format_diagnostic_report
p=Path('graphify-out');root=str(Path('.').resolve())
e=json.loads((p/'.graphify_extract.json').read_text());d=json.loads((p/'.graphify_detect.json').read_text())
G=build_from_json(e,root=root,directed=False)
if not G.number_of_nodes():raise SystemExit('ERROR: Graph is empty; existing outputs retained.')
communities=cluster(G);cohesion=score_all(G,communities)
gods=god_nodes(G);surprises=surprising_connections(G,communities)
labels={cid:'Community '+str(cid) for cid in communities}
questions=suggest_questions(G,communities,labels)
if not to_json(G,communities,str(p/'graph.json')):raise SystemExit('Shrink guard refused graph replacement.')
tokens={'input':e.get('input_tokens',0),'output':e.get('output_tokens',0)}
report=generate(G,communities,cohesion,labels,gods,surprises,d,tokens,root,suggested_questions=questions)
(p/'GRAPH_REPORT.md').write_text(report)
a={'communities':{str(k):v for k,v in communities.items()},'cohesion':{str(k):v for k,v in cohesion.items()},'gods':gods,'surprises':surprises,'questions':questions}
(p/'.graphify_analysis.json').write_text(json.dumps(a,ensure_ascii=False))
summary=diagnose_extraction(e,directed=False,root=root)
(p/'graph-health.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
(p/'graph-health.txt').write_text(format_diagnostic_report(summary))
print(f'Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities')
print(format_diagnostic_report(summary))
node_by_id={n['id']:n for n in e['nodes']}
for cid,ids in communities.items():
    paths={}
    for id in ids:
        src=node_by_id.get(id,{}).get('source_file','?');paths[src]=paths.get(src,0)+1
    labels_sample=[node_by_id.get(id,{}).get('label',id) for id in ids[:6]]
    print(json.dumps({'community':cid,'size':len(ids),'cohesion':cohesion[cid],'top_files':sorted(paths.items(),key=lambda kv:-kv[1])[:5],'sample':labels_sample},ensure_ascii=False))
