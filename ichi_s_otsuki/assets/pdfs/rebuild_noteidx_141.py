#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
noteidx.pdf を 141 件・#001 から抜けなく組み直す。

背景:
  noteidx_previous12.pdf は 2 ページ目が #008 から始まっており、
  #001〜#007 が欠落したまま代々引き継がれていた。
  ここで #001〜#007 のページを起こし、2 ページ目として挿入する。

構成:
  1 ページ目      カバー（141 件）
  2 ページ目      #001〜#007（knowledge.js の内容から新規作成）
  3〜20 ページ目  #008〜#137（previous12 の index 1〜18 を流用。ページ番号のみ +1 で刷り直す）
  21 ページ目〜   #138〜#141（毎回まとめて再生成）

以後の追記もこのスクリプトを更新して使うこと。
previous12 を素材にしているため、#001〜#007 の欠落が再発しない。
"""

import io, os, re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas as rl_canvas
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

KEEP_FROM, KEEP_TO = 1, 18          # previous12 の index（= #008〜#137）

# 作成日・スキ数は note.com の公開情報から取得（2026-08-25 時点）
HEAD_ENTRIES = [
    (1, '難しいことを難しいままに書く', '2025-05-02　♥  18',
     'https://note.com/ichi_s_otsuki/n/nbf0897ad7244',
     '知識や思想を平易にするだけでは本質が失われる。難解さを保ちながら正確に伝えることの重要性を論じる。'),
    (2, '人働説から知働説へ', '2025-05-03　♥  5',
     'https://note.com/ichi_s_otsuki/n/na2c302d3063d',
     '体を動かす「人働き」から知識・思考を働かせる「知働き」へのパラダイムシフトを論じる。'),
    (3, 'ソフトウェアってなんだろう？', '2025-05-04　♥  4',
     'https://note.com/ichi_s_otsuki/n/n4619e9d9b785',
     'ソフトウェアの本質的定義を問い直し、知働化時代における意味を探求する。'),
    (4, '正しいコミュニケーションの定義', '2025-05-06　♥  0',
     'https://note.com/ichi_s_otsuki/n/n8929b2a0f9e0',
     'コミュニケーションを学習・成長を伴う意味の修正・進化プロセスとして定義し直す。'),
    (5, '便利な「モデル」という言葉', '2025-05-08　♥  1',
     'https://note.com/ichi_s_otsuki/n/n9f6302a4e8d7',
     'モデルという概念の多義性を整理し、思考ツールとしての正確な使い方を論じる。'),
    (6, '組織化の原理', '2025-05-09　♥  2',
     'https://note.com/ichi_s_otsuki/n/nec78e737848f',
     '組織が形成・維持される根本原理を論じ、目的を中心とした組織設計を提唱する。'),
    (7, '『思考の技法』の探求：その哲学', '2025-05-10　♥  5',
     'https://note.com/ichi_s_otsuki/n/ncb3f2b4ec0de',
     '思考の技法の哲学的基盤と探求の姿勢を論じる。'),
]

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


def renumber_overlay(page_number):
    """既存ページの旧フッタを塗りつぶし、新しいページ番号を刷り直す。

    旧フッタの描画命令そのものを content stream から削除する方法も試したが、
    ページのフォント資源との対応が壊れて本文が文字化けしたため採用しなかった。
    見た目は正しく差し替わる。文字レイヤーには旧番号が残るため、
    テキスト抽出では旧番号も拾われる点だけ注意する。
    """
    buf = io.BytesIO()
    c = rl_canvas.Canvas(buf, pagesize=A4)
    c.setFillColor(colors.white)
    c.setStrokeColor(colors.white)
    c.rect(PAGE_W / 2 - 70 * mm, FOOT_Y - 3.5 * mm, 140 * mm, 9 * mm, stroke=0, fill=1)
    c.setFont(G, 8)
    c.setFillColor(colors.HexColor('#8AAAC8'))
    c.drawCentredString(PAGE_W / 2, FOOT_Y, f'{FOOT_LABEL}- {page_number} -')
    c.showPage()
    c.save()
    return PdfReader(io.BytesIO(buf.getvalue())).pages[0]


def main():
    d = os.path.dirname(os.path.abspath(__file__))
    src = os.path.join(d, 'noteidx_previous12.pdf')
    dest = os.path.join(d, 'noteidx.pdf')

    reader = PdfReader(src)
    writer = PdfWriter()

    # 1 ページ目：カバー
    writer.add_page(PdfReader(io.BytesIO(
        build_cover(141, '（第141番追記：2026 年 8 月 24 日）'))).pages[0])

    # 2 ページ目〜：#001〜#007
    head = PdfReader(io.BytesIO(build_entries(HEAD_ENTRIES, page_number=2)))
    for p in head.pages:
        writer.add_page(p)
    n = 1 + len(head.pages)

    # #008〜#137：既存ページを流用し、ページ番号だけ刷り直す
    for i in range(KEEP_FROM, KEEP_TO + 1):
        n += 1
        page = reader.pages[i]
        page.merge_page(renumber_overlay(n))
        writer.add_page(page)

    # #138〜#141
    tail = PdfReader(io.BytesIO(build_entries(TAIL_ENTRIES, page_number=n + 1)))
    for p in tail.pages:
        writer.add_page(p)
    n += len(tail.pages)

    with open(dest, 'wb') as f:
        writer.write(f)
    print(f'noteidx.pdf: {n} ページ（#001〜#141 の 141 件）')
    print(f'  カバー 1 / #001〜#007 {len(head.pages)} / #008〜#137 {KEEP_TO} / #138〜#141 {len(tail.pages)}')


if __name__ == '__main__':
    main()
