#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
noteidx_previous12.pdf（139件・20ページ）をもとに
  noteidx_previous13.pdf … #140 を追記（140件）
  noteidx.pdf            … #141 まで追記（141件）
を生成する。

方針は fix_noteidx_139.py を踏襲する。
  - index 0      … カバー（件数と追記日を差し替えて再生成）
  - index 1〜18  … #1〜#137（既存ページをそのまま流用）
  - index 19〜   … #138 以降を毎回まとめて再生成する
    （旧最終ページを残さないことで、過去に起きた重複を防ぐ）
本文は #1〜#125 と字形を揃えるため MS PGothic / MS PMincho を用いる。
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

KEEP_UPTO = 18   # index 1〜18（= #1〜#137）を流用する
TAIL_FROM_PAGE = 20


def make_footer(base_page_number, font_name):
    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont(font_name, 8)
        canvas.setFillColor(colors.HexColor('#8AAAC8'))
        canvas.drawCentredString(
            PAGE_W / 2, 12 * mm,
            f'note 作品インデックス（作成日順）- {base_page_number + canvas.getPageNumber() - 1} -'
        )
        canvas.restoreState()
    return footer


def build_cover_pdf(count, note_line):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=MAR, rightMargin=MAR,
                            topMargin=MAR, bottomMargin=18 * mm)
    ct = ParagraphStyle('ct', fontName=CG, fontSize=16, leading=26, alignment=1,
                        spaceAfter=6 * mm, textColor=colors.HexColor('#1d2f5f'))
    cs = ParagraphStyle('cs', fontName=CM, fontSize=10, leading=17, alignment=1,
                        textColor=colors.HexColor('#4E6A88'))
    story = [
        Spacer(1, 30 * mm),
        Paragraph('note 作品インデックス（作成日順）', ct),
        HRFlowable(width='80%', thickness=1.5,
                   color=colors.HexColor('#1d2f5f'), hAlign='CENTER'),
        Spacer(1, 4 * mm),
        Paragraph(f'1_s_o の note 作品を {count} 件を作成日順に掲載します。', cs),
        Spacer(1, 2 * mm),
        Paragraph(note_line, cs),
    ]
    footer = make_footer(1, CG)
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return buf.getvalue()


def make_entry(styles, num, title, date_heart, url, body):
    no_style, meta_style, url_style, body_style = styles
    return [KeepTogether([
        Paragraph(f'{num}. {title}', no_style),
        HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#1C3050')),
        Spacer(1, 1 * mm),
        Paragraph(f'作成日：{date_heart}', meta_style),
        Paragraph(f'URL：{url}', url_style),
        Paragraph(body, body_style),
        HRFlowable(width='100%', thickness=0.3, color=colors.HexColor('#1C3050')),
        Spacer(1, 4 * mm),
    ])]


ENTRIES = [
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
]


def build_tail_pages(upto, page_number):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=MAR, rightMargin=MAR,
                            topMargin=MAR, bottomMargin=18 * mm)
    styles = (
        ParagraphStyle('no', fontName=G, fontSize=11, leading=18,
                       textColor=colors.HexColor('#1d2f5f'), spaceAfter=1 * mm),
        ParagraphStyle('mt', fontName=G, fontSize=9, leading=14,
                       textColor=colors.HexColor('#4E6A88'), spaceAfter=1 * mm),
        ParagraphStyle('ur', fontName=G, fontSize=9, leading=14,
                       textColor=colors.HexColor('#5BA4CF'), spaceAfter=2 * mm),
        ParagraphStyle('bd', fontName=M, fontSize=9.5, leading=17,
                       textColor=colors.HexColor('#1C1C1C'), spaceAfter=4 * mm),
    )
    story = []
    for num, title, dh, url, body in ENTRIES:
        if num <= upto:
            story += make_entry(styles, num, title, dh, url, body)
    footer = make_footer(page_number, G)
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return buf.getvalue()


def build(src_path, dest_path, upto, count, note_line):
    reader = PdfReader(src_path)
    writer = PdfWriter()

    writer.add_page(PdfReader(io.BytesIO(build_cover_pdf(count, note_line))).pages[0])
    for i in range(1, KEEP_UPTO + 1):
        writer.add_page(reader.pages[i])

    tail = PdfReader(io.BytesIO(build_tail_pages(upto, TAIL_FROM_PAGE)))
    for page in tail.pages:
        writer.add_page(page)

    with open(dest_path, 'wb') as f:
        writer.write(f)
    total = 1 + KEEP_UPTO + len(tail.pages)
    print(f'{os.path.basename(dest_path)}: {total} ページ（#{upto} まで {count} 件）')


def main():
    d = os.path.dirname(os.path.abspath(__file__))
    src = os.path.join(d, 'noteidx_previous12.pdf')
    build(src, os.path.join(d, 'noteidx_previous13.pdf'),
          upto=140, count=140, note_line='（第140番追記：2026 年 8 月 12 日）')
    build(src, os.path.join(d, 'noteidx.pdf'),
          upto=141, count=141, note_line='（第141番追記：2026 年 8 月 24 日）')


if __name__ == '__main__':
    main()
