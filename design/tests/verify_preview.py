"""Exercise the illustrative preview, not MAIOS product behaviour.

Requires an already installed Playwright and Chromium. Installs/downloads nothing.
Usage: python design/tests/verify_preview.py --output /tmp/design-preview-proof
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
PREVIEW=ROOT/'exercises/2026-09-23/index.html'

def contrast(fg: str,bg: str)->float:
    def lum(s: str)->float:
        values=[int(s[i:i+2],16)/255 for i in (1,3,5)]
        values=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in values]
        return sum(a*b for a,b in zip(values,(.2126,.7152,.0722)))
    l1,l2=sorted((lum(fg),lum(bg)),reverse=True)
    return (l1+.05)/(l2+.05)

def run(output:Path,browser_path:str)->dict:
    output.mkdir(parents=True,exist_ok=True)
    cases=[]
    errors=[]
    external=[]
    def check(name:str,condition:bool,detail=None):
        cases.append({'name':name,'passed':bool(condition),'detail':detail})
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=browser_path,headless=True,args=['--no-sandbox'])
        context=browser.new_context(viewport={'width':1366,'height':900})
        page=context.new_page()
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('request',lambda r:external.append(r.url) if r.url.startswith(('https://','http://')) else None)
        page.set_content(PREVIEW.read_text(encoding='utf-8'));page.wait_for_timeout(100)
        for width,height in [(320,800),(375,812),(768,1024),(1024,900),(1366,900),(1920,1080)]:
            page.set_viewport_size({'width':width,'height':height})
            for mode in ('chat','project'):
                page.locator('#choose-'+mode).click();page.wait_for_timeout(320)
                dims=page.evaluate('({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth})')
                check(f'no_horizontal_overflow_{width}_{mode}',dims['sw']<=dims['cw']+1,dims)
                check(f'one_selection_{width}_{mode}',page.locator('button[aria-pressed="true"]').count()==1)
                check(f'matching_content_{width}_{mode}',page.locator('#product-name').inner_text()==('kernel_chat' if mode=='chat' else 'MAIOS Project Kernel'))
                boxes=[page.locator(x).bounding_box() for x in ['.hero-copy','.diagram']]
                if width>800:
                    a,b=boxes
                    check(f'separate_main_fields_{width}_{mode}',a['x']+a['width']<=b['x']+.5)
        page.set_viewport_size({'width':1366,'height':900})
        page.locator('#choose-chat').focus();page.keyboard.press('Enter');page.wait_for_timeout(320)
        check('selection_retains_control_focus',page.evaluate('document.activeElement.id')=='choose-chat')
        page.locator('#choose-project').focus();page.keyboard.press('Space');page.wait_for_timeout(320)
        check('keyboard_space_selects_project',page.locator('body').get_attribute('data-view')=='project')
        page.set_viewport_size({'width':375,'height':812})
        check('selection_survives_resize',page.locator('body').get_attribute('data-view')=='project')
        page.locator('summary').focus();page.keyboard.press('Enter')
        check('native_details_keyboard_open',page.locator('details').get_attribute('open') is not None)
        page.keyboard.press('Enter')
        check('native_details_keyboard_close',page.locator('details').get_attribute('open') is None)
        check('summary_retains_focus',page.evaluate('document.activeElement.tagName')=='SUMMARY')
        page.set_viewport_size({'width':1366,'height':900});page.locator('#choose-chat').click();page.wait_for_timeout(350)
        page.screenshot(path=str(output/'desktop-chat.png'),full_page=True)
        page.set_viewport_size({'width':375,'height':812});page.locator('#choose-project').click();page.wait_for_timeout(350)
        page.screenshot(path=str(output/'mobile-project.png'),full_page=True)
        page.emulate_media(reduced_motion='reduce');page.locator('#choose-chat').click()
        check('reduced_motion_no_panel_animation',page.locator('#product').evaluate('(e)=>getComputedStyle(e).animationName')=='none')
        check('reduced_motion_content_available',page.locator('#product-name').inner_text()=='kernel_chat')
        page.emulate_media(forced_colors='active')
        check('forced_colours_selected_control_visible',page.locator('#choose-chat').is_visible())
        check('forced_colours_selection_named',page.locator('#choose-chat').get_attribute('aria-pressed')=='true')
        check('no_external_resources_loaded',len(external)==0,external)
        check('no_javascript_errors',len(errors)==0,errors)
        fallback=browser.new_context(java_script_enabled=False,viewport={'width':375,'height':812})
        f=fallback.new_page();f.set_content(PREVIEW.read_text(encoding='utf-8'))
        check('no_js_chat_entry_available',f.locator('#product-link').is_visible())
        check('no_js_project_entry_available',f.locator('noscript a').is_visible())
        check('no_js_explanation_available',f.locator('#figure-description').is_visible())
        fallback.close()
        browser_version=browser.version
        context.close();browser.close()
    pairs={'main_text':('#14313a','#c7ecec'),'secondary_text':('#35545c','#c7ecec'),'card_text':('#14313a','#fff8e4'),'retained_text':('#14313a','#e6e5a9'),'next_text':('#14313a','#f7d993'),'diagram_note':('#35545c','#b9d8c5'),'action_text':('#fff8e4','#285d49')}
    ratios={name:round(contrast(*pair),3) for name,pair in pairs.items()}
    for name,ratio in ratios.items():check('opaque_pair_contrast_'+name,ratio>=4.5,ratio)
    result={'scope':'illustrative_HTML_CSS_preview_only_not_product_or_receiver_assimilation',
            'captured_at_utc':datetime.now(timezone.utc).isoformat(),
            'preview_sha256':hashlib.sha256(PREVIEW.read_bytes()).hexdigest(),
            'browser':browser_version,'render_mode':'exact_HTML_set_content_no_relative_resources','checks':cases,'passed':sum(c['passed'] for c in cases),
            'total':len(cases),'contrast_pairs':ratios,
            'not_claimed':['full_accessibility_audit','independent_first_encounter','MAIOS_runtime_behaviour','library_build','cross_host_installation']}
    (output/'browser-report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return result

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);parser.add_argument('--browser',default=shutil.which('chromium'))
    args=parser.parse_args()
    if not args.browser:parser.error('An installed Chromium path is required; nothing will be installed automatically.')
    result=run(args.output,args.browser)
    print(json.dumps({'passed':result['passed'],'total':result['total'],'preview_sha256':result['preview_sha256'],'browser':result['browser']},indent=2))
    raise SystemExit(0 if result['passed']==result['total'] else 1)
