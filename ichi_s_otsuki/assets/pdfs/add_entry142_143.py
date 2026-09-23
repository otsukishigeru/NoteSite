#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
noteidx_previous14.pdf（141 件）に #142・#143 を追記する。

出力:
  noteidx_previous15.pdf … #001〜#142（142 件）
  noteidx.pdf            … #001〜#143（143 件）

作り方:
  rebuild_noteidx_141.py を踏襲する。
  素材の 1〜20 ページ目（カバー／#001〜#007／#008〜#137）はそのまま流用し、
  カバーだけを件数・追記日を入れ替えたものに差し替える。
  末尾の #138 以降は毎回まとめて組み直すので、余白があれば同じページに、
  入らなければ reportlab が改ページして次のページに置く。
"""

import io, os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, KeepTogether
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader, PdfWriter

pdfmetrics.registerFont(UnicodeCIDFont('HeiseiKakuGo-W5'))
pdfmetrics.registerFont(UnicodeCIDFont('HeiseiMin-W3'))
CG, CM = 'HeiseiKakuGo-W5', 'HeiseiMin-W3'
pdfmetrics.registerFont(TTFont('MSPGothic', '/Library/Fonts/Microsoft/MS PGothic.ttf'))
pdfmetrics.registerFont(TTFont('MSPMincho', '/Library/Fonts/Microsoft/MS PMincho.ttf'))
G, M = 'MSPGothic', 'MSPMincho'

PAGE_W, PAGE_H = A4
MAR = 20 * mm
FOOT_Y = 12 * mm
FOOT_LABEL = 'note 作品インデックス（作成日順）'

SRC = 'noteidx_previous14.pdf'
KEEP_TO = 19          # 素材の 0 起点 index。1〜19（= 2〜20 ページ目）を流用する

# 末尾のまとまり。ここに足していく（作成日・スキ数は note.com の公開情報）
TAIL_ENTRIES = [
    (138, 'ロボティクス・アーキテクチャの構想：改訂版', '2026-07-21　♥  1',
     'https://note.com/ichi_s_otsuki/n/nee7edc6e64fb',
     '生成AIの実用化を前提に、AIのフレーム問題への処方箋として「問題フレーム」を位置づけたロボットシステムの'
     '設計方法論を構想する。意味を扱う4層と時間スケールの3層制御、自由エネルギー原理の閉ループからなる'
     'アーキテクチャを提示。意図の定義から段階的進化に至る8ステップのデザイン技法を構成し、'
     '人間・AI・フレームの役割を整理する。'),
    (139, 'ラディカル・AI社会', '2026-08-03　♥  1',
     'https://note.com/ichi_s_otsuki/n/n0a6d6bb95e4c',
     '生成AIの発達による社会構造の変貌と、人財が「創造的カテゴリー」と「技能的カテゴリー」に二極化していく原理を'
     '『思考の技法 2.0』に基づき急進的（ラディカル）な視点で考察する。'
     '自動化・機械化により技能的作業がAIに代替される中、'
     '新しい価値や「目的」を創造するイノベーションこそが人間に残された役割であると提示する論考。'),
    (140, '『思考の技法2.0』のエッセンス', '2026-08-12　♥  1',
     'https://note.com/ichi_s_otsuki/n/n6cb9fb04e262',
     '書籍『思考の技法 2.0』の骨格となる「目的」「抽象化／具体化」「コミュニケーション」の三本柱の関係性を整理。'
     '背景哲学である新実在論に基づき、実務で混同されやすい「意味の場」と「ドメイン」の違いを明確に定義する。'
     '具体化はAIに委ねつつ、目的を伴う抽象化は人間が担うべき領域として残るという、'
     'AI時代の役割分担を提示する解説資料。'),
    (141, 'AI時代の要求工学【概説編】', '2026-08-24　♥  0',
     'https://note.com/ichi_s_otsuki/n/n8f5a693fab52',
     '生成AIの登場によってシステム実装のコストがゼロに近づく時代における、'
     '人間の本質的な役割となる新たな要求定義の在り方を提示した概説。'
     '従来の「作るのが高い」という前提から派生した古い常識を棄却し、'
     '「目的」「抽象山」「意味の場」の3つの核心概念を整理する。'
     '5つの局面と8つの原理からなる「知働化要求定義」の手順に加え、'
     '「超マシン記述」など実践的な5つの技法をわかりやすく解説している。'),
    (142, 'Symposium2026開催予定', '2026-09-07　♥  1',
     'https://note.com/ichi_s_otsuki/n/n53d3c17b0d64',
     '2026年11月14日に開催予定の第4回「Symposium2026」の開催概要と趣旨を解説した論考。'
     'アジャイルプロセス協議会の終了に伴う「知働化コミュニティ」への再スタートや、'
     '高野明彦氏による「連想情報学」とボーム・ダイアローグに関する基調講演の構想を提示している。'
     'さらに「AI活用の実践原理と哲学」「要求工学新時代の人間の役割」をテーマとする'
     '2つの並行トラックのセッション構成と議論の狙いを整理している。'),
    (143, '文筆という活動', '2026-09-22　♥  0',
     'https://note.com/ichi_s_otsuki/n/n925c817dee8c',
     'note執筆143作目を迎えた著者が、AI活用を踏まえた「文筆活動」の変容と本質を論じた論考。'
     '問題設定や定式化といった創造的活動は人間が担い、'
     '調査・推敲・ビジュアル化などの技能的活動にAIを限る役割分担の重要性を提唱している。'
     '執筆を通じた概念の解像度向上を「抽象山」のメタファーで捉え直し、'
     '人間の意図に基づくテキストの蓄積と継続的探求の大切さを提示している。'),
]


def make_footer(base_page_number, font_name):
    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont(font_name, 8)
        canvas.setFillColor(colors.HexColor('#8AAAC8'))
        canvas.drawCentredString(
            PAGE_W / 2, FOOT_Y,
            f'{FOOT_LABEL}- {base_page_number + canvas.getPageNumber() - 1} -')
        canvas.restoreState()
    return footer


def build_cover(count, note_line):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=MAR, rightMargin=MAR,
                            topMargin=MAR, bottomMargin=18 * mm)
    ct = ParagraphStyle('ct', fontName=CG, fontSize=16, leading=26, alignment=1,
                        spaceAfter=6 * mm, textColor=colors.HexColor('#1d2f5f'))
    cs = ParagraphStyle('cs', fontName=CM, fontSize=10, leading=17, alignment=1,
                        textColor=colors.HexColor('#4E6A88'))
    story = [
        Spacer(1, 30 * mm),
        Paragraph(FOOT_LABEL, ct),
        HRFlowable(width='80%', thickness=1.5,
                   color=colors.HexColor('#1d2f5f'), hAlign='CENTER'),
        Spacer(1, 4 * mm),
        Paragraph(f'1_s_o の note 作品を {count} 件を作成日順に掲載します。', cs),
        Spacer(1, 2 * mm),
        Paragraph(note_line, cs),
    ]
    doc.build(story, onFirstPage=make_footer(1, CG), onLaterPages=make_footer(1, CG))
    return buf.getvalue()


def styles():
    return (
        ParagraphStyle('no', fontName=G, fontSize=11, leading=18,
                       textColor=colors.HexColor('#1d2f5f'), spaceAfter=1 * mm),
        ParagraphStyle('mt', fontName=G, fontSize=9, leading=14,
                       textColor=colors.HexColor('#4E6A88'), spaceAfter=1 * mm),
        ParagraphStyle('ur', fontName=G, fontSize=9, leading=14,
                       textColor=colors.HexColor('#5BA4CF'), spaceAfter=2 * mm),
        ParagraphStyle('bd', fontName=M, fontSize=9.5, leading=17,
                       textColor=colors.HexColor('#1C1C1C'), spaceAfter=4 * mm),
    )


def build_entries(entries, page_number):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=MAR, rightMargin=MAR,
                            topMargin=MAR, bottomMargin=18 * mm)
    no_s, meta_s, url_s, body_s = styles()
    story = []
    for num, title, dh, url, body in entries:
        story.append(KeepTogether([
            Paragraph(f'{num}. {title}', no_s),
            HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#1C3050')),
            Spacer(1, 1 * mm),
            Paragraph(f'作成日：{dh}', meta_s),
            Paragraph(f'URL：{url}', url_s),
            Paragraph(body, body_s),
            HRFlowable(width='100%', thickness=0.3, color=colors.HexColor('#1C3050')),
            Spacer(1, 4 * mm),
        ]))
    footer = make_footer(page_number, G)
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return buf.getvalue()


def build(dest, last_num, note_line):
    d = os.path.dirname(os.path.abspath(__file__))
    reader = PdfReader(os.path.join(d, SRC))
    writer = PdfWriter()

    writer.add_page(PdfReader(io.BytesIO(build_cover(last_num, note_line))).pages[0])
    for i in range(1, KEEP_TO + 1):
        writer.add_page(reader.pages[i])
    n = 1 + KEEP_TO

    entries = [e for e in TAIL_ENTRIES if e[0] <= last_num]
    tail = PdfReader(io.BytesIO(build_entries(entries, page_number=n + 1)))
    for p in tail.pages:
        writer.add_page(p)
    n += len(tail.pages)

    with open(os.path.join(d, dest), 'wb') as f:
        writer.write(f)
    print(f'{dest}: {n} ページ（#001〜#{last_num} の {last_num} 件）'
          f' / 末尾 #{entries[0][0]}〜#{last_num} は {len(tail.pages)} ページ')


def main():
    build('noteidx_previous15.pdf', 142, '（第142番追記：2026 年 9 月 7 日）')
    build('noteidx.pdf', 143, '（第143番追記：2026 年 9 月 22 日）')


if __name__ == '__main__':
    main()
