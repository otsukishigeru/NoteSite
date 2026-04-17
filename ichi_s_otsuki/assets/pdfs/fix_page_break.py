#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NoteIdx.pdf の126番と127番が別ページになっているのを修正する。
- 現行18ページのうち、ページ1〜16（カバー＋項目1〜125）を保持
- 126番と127番を同一ページに配置した新ページを生成して追加
- 計17ページのPDFとして出力
"""

import io, os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from pypdf import PdfReader, PdfWriter

pdfmetrics.registerFont(UnicodeCIDFont('HeiseiKakuGo-W5'))
pdfmetrics.registerFont(UnicodeCIDFont('HeiseiMin-W3'))
G = 'HeiseiKakuGo-W5'
M = 'HeiseiMin-W3'

PAGE_W, PAGE_H = A4
MAR = 20 * mm


def make_footer(page_offset: int):
    """最終PDF内での正しいページ番号を表示するフッター関数を返す"""
    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont(G, 8)
        canvas.setFillColor(colors.HexColor('#8AAAC8'))
        page_num = doc.page + page_offset
        canvas.drawCentredString(
            PAGE_W / 2, 12 * mm,
            f'note 作品インデックス（作成日順）- {page_num} -'
        )
        canvas.restoreState()
    return footer


def build_combined_last_page(page_number: int) -> bytes:
    """126番と127番を1ページにまとめたPDFをバイト列で返す"""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=MAR, rightMargin=MAR,
        topMargin=MAR, bottomMargin=18 * mm
    )

    no_style = ParagraphStyle(
        'no', fontName=G, fontSize=11, leading=18,
        textColor=colors.HexColor('#1d2f5f'), spaceAfter=1 * mm
    )
    meta_style = ParagraphStyle(
        'mt', fontName=G, fontSize=9, leading=14,
        textColor=colors.HexColor('#4E6A88'), spaceAfter=1 * mm
    )
    url_style = ParagraphStyle(
        'ur', fontName=G, fontSize=9, leading=14,
        textColor=colors.HexColor('#5BA4CF'), spaceAfter=2 * mm
    )
    body_style = ParagraphStyle(
        'bd', fontName=M, fontSize=9.5, leading=17,
        textColor=colors.HexColor('#1C1C1C'), spaceAfter=4 * mm
    )

    story = [
        # ── 126番 ──────────────────────────────────────────────
        Paragraph('126. ティール思想とアスケル思想の対比', no_style),
        HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#1C3050')),
        Spacer(1, 1 * mm),
        Paragraph('作成日：2026-04-03　♥ 0', meta_style),
        Paragraph('URL：https://note.com/ichi_s_otsuki/n/nf18fe4ad69e7', url_style),
        Paragraph(
            'ピーター・ティールとアマンダ・アスケルの思想対比を通じ、'
            '「AIは人間の価値観の外にある力」vs'
            '「AIの価値観は設計可能であり設計する責任がある」という哲学的対立を考察。'
            '混迷する世界の中でAIテクノロジーの社会浸透の方向性を問う。',
            body_style
        ),
        HRFlowable(width='100%', thickness=0.3, color=colors.HexColor('#1C3050')),
        Spacer(1, 4 * mm),
        # ── 127番 ──────────────────────────────────────────────
        Paragraph(
            '127. AIトークンエコノミー'
            '　— 知働化サイトのコストモデル（AI-COCOMO）を事例として',
            no_style
        ),
        HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#1C3050')),
        Spacer(1, 1 * mm),
        Paragraph('作成日：2026-04-13　♥ —', meta_style),
        Paragraph('URL：https://note.com/ichi_s_otsuki/n/ne4028c50cfe9', url_style),
        Paragraph(
            'COCOMO II を生成AI時代に拡張したコストモデル「AI-COCOMO」を提案・解説する。'
            '知働化サイト（chidouka-lab.com）の実装データに基づき、'
            '従来型開発・現状AI支援・AI最大委任の3シナリオでコストを試算。'
            '¥1,475K → ¥326K → ¥115K と段階的に圧縮されることを示す。'
            'AIへの委任が増すほど人間の役割は「ビジョン定義・ドメイン判断・品質承認」に集中し、'
            'コスト構造が「作るコスト」から「確認するコスト」へ転換することを論じる。'
            'ファンクションポイント・KLOC・スケールファクタ・コストドライバ・AI代替率α・'
            'トークン単価・統合OH率δなど、全パラメータを定義した理論モデルを提示。'
            'なお、本論考をもとにしたWebシミュレータを chidouka-lab.com/AI-COCOMO/ で公開。',
            body_style
        ),
        HRFlowable(width='100%', thickness=0.3, color=colors.HexColor('#1C3050')),
    ]

    # page_number はこのサブドキュメントでの doc.page (=1) に対するオフセット
    offset = page_number - 1
    footer_fn = make_footer(offset)
    doc.build(story, onFirstPage=footer_fn, onLaterPages=footer_fn)
    return buf.getvalue()


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(base_dir, 'NoteIdx.pdf')

    reader = PdfReader(path)
    total = len(reader.pages)
    print(f'現行ページ数: {total}')

    # 現行PDF構成:
    #   index 0        = カバー
    #   index 1〜15    = 項目1〜125（15ページ）
    #   index 16       = 項目126のみ（空白が多い）
    #   index 17       = 項目127のみ（patch_noteidx.py で追加）
    #
    # 修正後:
    #   index 0        = カバー
    #   index 1〜15    = 項目1〜125
    #   index 16       = 項目126＋127（新規生成）  ← ページ番号17

    keep_until = total - 2  # 16ページ（index 0〜15）を保持
    new_last_page_number = keep_until + 1  # 17

    writer = PdfWriter()
    for i in range(keep_until):
        writer.add_page(reader.pages[i])

    combined = PdfReader(io.BytesIO(build_combined_last_page(new_last_page_number)))
    writer.add_page(combined.pages[0])

    with open(path, 'wb') as f:
        writer.write(f)

    print(f'NoteIdx.pdf 更新完了: {total} ページ → {new_last_page_number} ページ')
    print(f'出力先: {path}')


if __name__ == '__main__':
    main()
