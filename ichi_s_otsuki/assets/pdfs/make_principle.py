#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Principle.pdf 生成スクリプト
格言・教え集：知働化の原則（第1条〜第21条）
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                 HRFlowable, PageBreak)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont

# 日本語フォント登録
pdfmetrics.registerFont(UnicodeCIDFont('HeiseiKakuGo-W5'))
pdfmetrics.registerFont(UnicodeCIDFont('HeiseiMin-W3'))

FONT_GOTHIC  = 'HeiseiKakuGo-W5'
FONT_MINCHO  = 'HeiseiMin-W3'

PAGE_W, PAGE_H = A4
MARGIN = 20 * mm

def build_styles():
    s = getSampleStyleSheet()
    base = dict(fontName=FONT_GOTHIC, leading=18)

    cover_title = ParagraphStyle('cover_title',
        fontName=FONT_GOTHIC, fontSize=18, leading=28,
        alignment=1, spaceAfter=6*mm, textColor=colors.HexColor('#1d2f5f'))

    cover_sub = ParagraphStyle('cover_sub',
        fontName=FONT_GOTHIC, fontSize=10, leading=16,
        alignment=1, textColor=colors.HexColor('#4E6A88'))

    article_no = ParagraphStyle('article_no',
        fontName=FONT_GOTHIC, fontSize=13, leading=20,
        textColor=colors.HexColor('#1d2f5f'), spaceBefore=6*mm, spaceAfter=1*mm)

    article_title = ParagraphStyle('article_title',
        fontName=FONT_GOTHIC, fontSize=12, leading=20,
        textColor=colors.HexColor('#1d2f5f'), spaceAfter=2*mm)

    label = ParagraphStyle('label',
        fontName=FONT_GOTHIC, fontSize=9, leading=14,
        textColor=colors.HexColor('#5C2407'), spaceBefore=2*mm, spaceAfter=1*mm)

    body = ParagraphStyle('body',
        fontName=FONT_MINCHO, fontSize=9.5, leading=16,
        textColor=colors.HexColor('#1C1C1C'), spaceAfter=2*mm)

    url = ParagraphStyle('url',
        fontName=FONT_GOTHIC, fontSize=8, leading=13,
        textColor=colors.HexColor('#4E6A88'), spaceAfter=4*mm)

    footer_style = ParagraphStyle('footer_style',
        fontName=FONT_GOTHIC, fontSize=8, leading=13,
        alignment=1, textColor=colors.HexColor('#4E6A88'))

    return dict(cover_title=cover_title, cover_sub=cover_sub,
                article_no=article_no, article_title=article_title,
                label=label, body=body, url=url, footer=footer_style)

# ─────────────────────────────────────────────
# 格言データ（第1〜第21条）
# ─────────────────────────────────────────────
PRINCIPLES = [
    {
        "no": "第1条",
        "title": "難しいことを難しいままに書く",
        "msg": "知識の本質を失わないためには、平易さへの迎合を戒め、思考の深度を守ることが重要である。",
        "desc": "真に価値ある知識は、単純化しすぎれば本質を失う。難解さをそのまま保ちながら正確に伝えることこそ、知性の誠実な在り方である。",
        "url": "https://note.com/ichi_s_otsuki/n/nbf0897ad7244",
    },
    {
        "no": "第2条",
        "title": "人働説から知働説へ",
        "msg": "これからの時代、体を動かす「人働き」から知識・思考を働かせる「知働き」へのパラダイムシフトが求められる。",
        "desc": "労働の本質が変わりつつある。知識主導社会においては、思考すること自体が最も重要な生産活動となる。人間の本質的な価値は「考える力」にある。",
        "url": "https://note.com/ichi_s_otsuki/n/na2c302d3063d",
    },
    {
        "no": "第3条",
        "title": "目的なき組織は混迷に陥る",
        "msg": "事業・活動・システムの目的を明確に設定することなしに、成功はあり得ない。目的こそがすべての判断の拠り所である。",
        "desc": "適切な目的を設定することは大変難しいが、目的なしには意思決定の論拠を見失う。目的策定は存在意義のデザインであり、イノベーションの起点となる。",
        "url": "https://note.com/ichi_s_otsuki/n/n94c8b5fed7c6",
    },
    {
        "no": "第4条",
        "title": "昨日の安穏の延長線上に明日はない",
        "msg": "豊かな将来像を描き、仕組みを作り、それを遂行する一連の活動を怠ると、いつの間にか世界の中で低迷した状況に転落する。",
        "desc": "現代は知識主導社会であり、知恵を絞り、思考し、的確な意思決定をしていくという知の基本動作を継続しなければならない。変革を怠ることのコストは見えにくいが深刻である。",
        "url": "https://note.com/ichi_s_otsuki/n/ne4ecd4e45d87",
    },
    {
        "no": "第5条",
        "title": "哲学は考えることについての病を治療する",
        "msg": "哲学は抽象的な学問ではなく、思考の歪みや先入観という「病」を癒し、正確な認識と判断を取り戻すための実践的道具である。",
        "desc": "ガブリエルの言葉を借りれば、哲学とは考えることへの問いを立てること。知識主導社会では哲学的思考こそが実践知の基盤となる。",
        "url": "https://note.com/ichi_s_otsuki/n/n5d956db3dc96",
    },
    {
        "no": "第6条",
        "title": "変化対応から適応進化へ",
        "msg": "組織は変化に「対応」するだけでは不十分で、自律的に「適応・進化」する能力を育むことが真の競争力となる。",
        "desc": "ダーウィン進化論のアナロジーが示すように、環境の変化に対して漸進的に対応するのではなく、自らが変化を先取りして進化していく組織こそが長期的に生き残る。",
        "url": "https://note.com/ichi_s_otsuki/n/n325181484944",
    },
    {
        "no": "第7条",
        "title": "知識は与えられるものではなく、自ら構成するものである",
        "msg": "真の知識は外から与えられるものでなく、自らが問い・探求・対話を通じて構成・組み立てていくものである。",
        "desc": "構成主義的認識論が示すように、知識の習得とは能動的な知の構成行為である。学習の本質は受動的な情報受信ではなく、自律的な意味形成にある。",
        "url": "https://note.com/ichi_s_otsuki/n/n38467b1d6ebb",
    },
    {
        "no": "第8条",
        "title": "発達の本質：解像度・真摯さ・尊厳",
        "msg": "人の成長は「解像度（細かく見る力）」「真摯さ（向き合う誠実さ）」「尊厳（自己尊重）」の三つによって測られる。",
        "desc": "学歴や技術習得だけでなく、世界をどれだけ細かく正確に認識できるか（解像度）、物事に真剣に向き合うか（真摯さ）、自分自身を大切にしているか（尊厳）が発達の真の指標である。",
        "url": "https://note.com/ichi_s_otsuki/n/n250790eaf2c8",
    },
    {
        "no": "第9条",
        "title": "AIが代替できない人間固有の能力を磨け",
        "msg": "AI時代に求められるのは、AIには真似できない創造性・判断力・意味形成・倫理的感性という人間固有の能力である。",
        "desc": "HIとAIの役割分担を正確に理解し、人間はAIが苦手とする価値創造・文脈理解・本質的問いを立てる能力に特化することが、AI時代の個人と組織の生存戦略となる。",
        "url": "https://note.com/ichi_s_otsuki/n/neb02cd2ed246",
    },
    {
        "no": "第10条",
        "title": "言語ゲームが現実をつくる",
        "msg": "言語は単に現実を「記述」するだけでなく、それ自体が現実を「構成」する力を持つ。言葉の選択は世界観の選択である。",
        "desc": "ヴィトゲンシュタインの言語ゲーム理論が示す通り、私たちが使う言語・概念・語彙は、認識・行動・組織文化を根本から規定している。言語の刷新はパラダイムシフトの第一歩である。",
        "url": "https://note.com/ichi_s_otsuki/n/n3c5047391680",
    },
    {
        "no": "第11条",
        "title": "アーキテクトは全体の設計思想を担う存在である",
        "msg": "ソフトウェア・組織・システムのアーキテクトとは、技術者でも管理者でもなく、全体の意図・構造・価値を体現する知的設計者である。",
        "desc": "建築家がサグラダ・ファミリアの全体観を持つように、アーキテクトはシステム全体の一貫した設計思想を維持・発展させる責任を担う。この役割なしに複雑なシステムは真に機能しない。",
        "url": "https://note.com/ichi_s_otsuki/n/nb44939fcb380",
    },
    {
        "no": "第12条",
        "title": "人財の創造的カテゴリが組織の価値を決める",
        "msg": "AI時代において組織の価値は、創造的に考えるアーキテクト型人材と、それを支える技能型人材がいかに連携・組織化されるかによって決まる。",
        "desc": "人財の二極化が進む中、単なる人件費削減ではなく、創造的知性と技術的実行力を有機的に結合させる組織設計こそが持続的競争優位の源泉となる。",
        "url": "https://note.com/ichi_s_otsuki/n/n3b2e95dfe869",
    },
    {
        "no": "第13条",
        "title": "死の行進からの脱却には本質的な方法論の転換が必要",
        "msg": "ソフトウェアプロジェクトの崩壊（死の行進）は管理強化では解決しない。知識・目的・構造を根本から問い直す思考の転換が必要である。",
        "desc": "人月の神話が示す問題は今も続く。解決策は工数管理の精緻化ではなく、問題領域の本質的理解、目的主導の設計、知働化プロセスへの転換にある。",
        "url": "https://note.com/ichi_s_otsuki/n/n861e3979bfeb",
    },
    {
        "no": "第14条",
        "title": "組織知能は暗黙知・形式知・実践知の三位一体",
        "msg": "組織が知性を持つとは、言語化された形式知だけでなく、暗黙の経験知と実際の行動知が三位一体となって機能することである。",
        "desc": "知識管理の失敗の多くは形式知（マニュアル・文書）だけを扱い、暗黙知や実践知を軽視することにある。三つの知が有機的に循環してこそ組織知能は高まる。",
        "url": "https://note.com/ichi_s_otsuki/n/ne015c297417d",
    },
    {
        "no": "第15条",
        "title": "プラグマティズム：真理は実践において証明される",
        "msg": "真理や知識の価値は、抽象的な正しさではなく、実際に役立つかどうか（実践的有用性）によって判断されるべきである。",
        "desc": "パース・ジェームズ・デューイのプラグマティズムが示す通り、知識は行動と切り離せない。思考の技法が「実行可能知識」を重視するのはこの哲学的立場に基づいている。",
        "url": "https://note.com/ichi_s_otsuki/n/n0da9890f40d8",
    },
    {
        "no": "第16条",
        "title": "社会的現実は集合的志向性によって構成される",
        "msg": "お金・法律・組織などの社会的事実は物理的実体ではなく、人々の集合的な承認と志向性によって成立している。",
        "desc": "サールの社会存在論が示す通り、制度・組織・規範は「みんながそう扱う」という集合的志向性によって現実となる。この理解は組織変革・制度設計に根本的な示唆をもたらす。",
        "url": "https://note.com/ichi_s_otsuki/n/n957275fe758c",
    },
    {
        "no": "第17条",
        "title": "ソフトウェア学はパラダイムシフトの連続である",
        "msg": "ウォータフォールからアジャイル、そしてAI時代の知働化へ。ソフトウェア開発の歴史は固定した技術論ではなく、思考様式の根本的転換の繰り返しである。",
        "desc": "技術だけでなく開発の哲学・人間観・組織観が変わるたびにパラダイムが転換してきた。現在のAI革命もまた、その連続線上の根本的転換点として捉える必要がある。",
        "url": "https://note.com/ichi_s_otsuki/n/n00cb318c636d",
    },
    {
        "no": "第18条",
        "title": "偉人・賢人の肩の上に立って思考する",
        "msg": "知的巨人たちの著作・思想を深く学び追跡し、その肩の上に立つことで、独自の思考の高みに到達できる。",
        "desc": "ニュートンの言葉「巨人の肩の上に乗って」が示すように、先人の知恵を深く吸収した上での独創こそが真の知的貢献となる。安易な独自性よりも深い継承が創造の土台となる。",
        "url": "https://note.com/ichi_s_otsuki/n/nc8d9149f100b",
    },
    {
        "no": "第19条",
        "title": "対話こそが組織の知性を高める根本手段",
        "msg": "個人の思考の限界を超えるために、オープンな対話・ディスコースの場を設け、集合的に知を構成していく対話文化が組織知性の源泉となる。",
        "desc": "オープンダイアローグが示すように、対話は問題解決の手段を超え、現実そのものを構成する行為である。組織に安全な対話空間を設けることが知働化の実践的出発点となる。",
        "url": "https://note.com/ichi_s_otsuki/n/na67ca4778f0b",
    },
    {
        "no": "第20条",
        "title": "目的策定は存在意義のデザインである",
        "msg": "個人・組織・システムにとって「何のために存在するか」という目的を設計することは、単なる目標設定を超えた、存在意義そのものを創造する行為である。",
        "desc": "正しい目的設定なしに事業や組織の成功はない。目的は活動の方向性を示すだけでなく、関わる人々の動機・判断・協力を引き出す根本的な力を持つ。パーパスこそが知働化組織の核心である。",
        "url": "https://note.com/ichi_s_otsuki/n/n94c8b5fed7c6",
    },
    # ── 第21条：第127番論考より新規追加 ──
    {
        "no": "第21条",
        "title": "AIの活用でコストは「作るコスト」から「確認するコスト」へ転換する",
        "msg": "AIに開発を委任するほど、人間に残る作業は「ビジョンの定義」「ドメイン知識に基づく判断」「品質の最終承認」に集中し、コスト構造が根本から変容する。",
        "desc": (
            "AI-COCOMOモデルによる試算では、従来型開発（¥1,475K）→現状AI支援（¥326K）→AI最大委任（¥115K）と"
            "コストは段階的に圧縮される。一方でAI最大委任シナリオでは人件費比率が92%から60%に下がり、"
            "AIコスト（19%）と統合コスト（21%）が合計40%を占めるようになる。"
            "これは単なる効率化ではなく、「作ること」から「判断・承認すること」への役割転換を意味する。"
            "初学者にとっては逆に高難度化する側面もあり、ビジョン定義力・ドメイン知識・品質判断力の"
            "重要性が増す。AI-COCOMOはこの構造転換を定量的に表現する知働化コストモデルの第一歩である。"
        ),
        "url": "https://note.com/ichi_s_otsuki/n/ne4028c50cfe9",
    },
]

def on_page(canvas, doc):
    """フッター描画"""
    canvas.saveState()
    canvas.setFont(FONT_GOTHIC, 8)
    canvas.setFillColor(colors.HexColor('#8AAAC8'))
    page_num = doc.page
    total = getattr(doc, '_total_pages', '?')
    canvas.drawCentredString(PAGE_W / 2, 12 * mm,
        f'格言・教え集：知働化の原則 - {page_num} -')
    canvas.restoreState()

def build_pdf(out_path):
    doc = SimpleDocTemplate(
        out_path,
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=18 * mm,
        title='格言・教え集：知働化の原則',
        author='1_s_o',
    )

    st = build_styles()
    story = []

    # ── 表紙 ──
    story.append(Spacer(1, 30 * mm))
    story.append(Paragraph('格言・教え集：知働化の原則', st['cover_title']))
    story.append(HRFlowable(width='80%', thickness=1.5,
                             color=colors.HexColor('#1d2f5f'), hAlign='CENTER'))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph(
        '— 1_s_o の note 作品群から抽出した 21 の知恵 —', st['cover_sub']))
    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph(
        '以下は、知働化・思考の技法・組織論・哲学にわたる note 作品群から、'
        '格言・教えとして特に有効と思われる 21 件を抽出し、メッセージとして整理したものです。',
        ParagraphStyle('intro', fontName=FONT_MINCHO, fontSize=9.5, leading=17,
                       alignment=1, textColor=colors.HexColor('#4E6A88'),
                       leftIndent=10 * mm, rightIndent=10 * mm)))
    story.append(PageBreak())

    # ── 各条 ──
    for p in PRINCIPLES:
        story.append(Paragraph(p['no'], st['article_no']))
        story.append(Paragraph(p['title'], st['article_title']))
        story.append(HRFlowable(width='100%', thickness=0.5,
                                 color=colors.HexColor('#1C3050')))
        story.append(Spacer(1, 1.5 * mm))
        story.append(Paragraph('【メッセージ】', st['label']))
        story.append(Paragraph(p['msg'], st['body']))
        story.append(Paragraph('【解説】', st['label']))
        story.append(Paragraph(p['desc'], st['body']))
        story.append(Paragraph('【参照元】', st['label']))
        story.append(Paragraph(p['url'], st['url']))
        story.append(HRFlowable(width='100%', thickness=0.3,
                                 color=colors.HexColor('#1C3050'),
                                 spaceAfter=2 * mm))

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f'PDF生成完了: {out_path}')

if __name__ == '__main__':
    import os
    out = os.path.join(os.path.dirname(__file__), 'Principle.pdf')
    build_pdf(out)
