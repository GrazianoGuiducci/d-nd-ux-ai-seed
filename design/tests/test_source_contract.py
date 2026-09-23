"""Structural source checks. These do not evaluate semantic competence quality."""
from __future__ import annotations
import json
import os
from pathlib import Path
import re
import unittest

ROOT=Path(__file__).resolve().parents[2]
MANIFEST=ROOT/'DESIGN_KERNEL_MANIFEST.json'
BASELINE_PACKAGE=Path(os.environ.get('DESIGN_BASELINE_PACKAGE',str(ROOT/'package.json')))

class SourceContract(unittest.TestCase):
    def setUp(self):
        self.m=json.loads(MANIFEST.read_text(encoding='utf-8'))
    def test_identity_and_source_version(self):
        self.assertEqual(self.m['kernel_id'],'dnd-design-kernel')
        self.assertEqual(self.m['version'],'0.1.0')
        self.assertIn('0.1.0',(ROOT/self.m['entry']).read_text())
    def test_unique_faculty_ids_and_paths(self):
        ids=[f['id'] for f in self.m['faculties']]
        paths=[f['path'] for f in self.m['faculties']]
        self.assertEqual(len(ids),len(set(ids)))
        self.assertEqual(len(paths),len(set(paths)))
    def test_new_faculties_are_readable_bodies(self):
        for f in self.m['faculties']:
            if not f['path'].startswith('design/'):continue
            with self.subTest(faculty=f['id']):
                text=(ROOT/f['path']).read_text(encoding='utf-8')
                self.assertTrue(text.startswith('---\n'))
                self.assertIn('name: '+f['id'],text)
                self.assertIn('description:',text)
                self.assertTrue(text.split('---',2)[-1].strip())
    def test_new_manifest_targets_exist(self):
        paths=[self.m[k] for k in ('entry','current','exchange','reconciliation','exercise')]
        paths += [x['path'] for x in self.m['adapters']+self.m['profiles']]
        for path in paths:
            with self.subTest(path=path):self.assertTrue((ROOT/path).is_file())
    def test_seed_roles_not_replaced(self):
        baseline={x['id']:x for x in self.m['faculties'] if x.get('disposition')=='unchanged'}
        self.assertEqual(set(baseline),{'agentic-ux-seed','d-nd-ux-ai-seed'})
        self.assertEqual(self.m['library']['registry'],'seed.registry.json')
    def test_no_background_or_required_external_stack(self):
        self.assertIs(self.m['background_autonomy'],False)
        self.assertTrue(all(not x['required_always'] for x in self.m['external_roles']))
    def test_adapters_do_not_claim_installation(self):
        self.assertTrue(all(x['state']=='source_present_not_installed' for x in self.m['adapters']))
    def test_profile_has_separate_source_and_state(self):
        profile=self.m['profiles'][0]
        self.assertTrue(profile['path'].startswith('design/profiles/'))
        self.assertEqual(profile['state'],'current_source_profile_new_artifacts_candidate')
        self.assertIn('observed source:',(ROOT/profile['path']).read_text())
    def test_no_private_workspace_paths_in_new_methods(self):
        for file in list((ROOT/'design/skills').glob('*/SKILL.md'))+[ROOT/self.m['entry']]:
            with self.subTest(path=str(file)):
                self.assertFalse(re.search(r'C:\\|C:/PVSC|/opt/|/root/\.codex',file.read_text()))
    def test_local_new_markdown_links(self):
        texts=[ROOT/self.m['entry'],ROOT/'AGENTS.md']+list((ROOT/'design').rglob('*.md'))
        inherited={'skills/agentic-ux-seed/SKILL.md','skills/d-nd-ux-ai-seed/SKILL.md'}
        for file in texts:
            for href in re.findall(r'\]\(([^)]+)\)',file.read_text()):
                if '://' in href or href.startswith('#'):continue
                rel=href.split('#')[0]
                p=(file.parent/rel).resolve()
                if p.relative_to(ROOT).as_posix() in inherited:continue
                with self.subTest(source=str(file),link=href):self.assertTrue(p.exists())
    @unittest.skipUnless(BASELINE_PACKAGE.exists(),'Original package manifest not available in this local source subset')
    def test_design_sources_outside_library_include_list(self):
        package=json.loads(BASELINE_PACKAGE.read_text())
        self.assertNotIn('design',package['files'])
        self.assertNotIn('DESIGN_KERNEL.md',package['files'])
        self.assertNotIn('DESIGN_KERNEL_MANIFEST.json',package['files'])
        self.assertFalse(any('design/' in x for x in package['exports']))
    def test_candidate_evidence_not_promoted(self):
        self.assertEqual(self.m['candidate_lineage']['disposition'],'selected_relations_reexpressed_original_pr_unchanged')

if __name__=='__main__':unittest.main()
