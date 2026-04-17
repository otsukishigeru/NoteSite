#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NoteIdx.pdf の最終ページ（126番＋127番）をフォント修正版に差し替える。

入力 17ページ構成:
  index 0     = カバー
  index 1〜15 = 項目1〜125
  index 16    = 項目126＋127（CIDフォントで文字間隔が崩れている）

出力 17ページ構成:
  index 0     = カバー（変更なし）
  index 1〜15 = 項目1〜125（変更なし）
  index 16    = 項目126＋127（TrueTypeフォントで再生成）
"""

import io, os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader, PdfWriter

# ── フォント登録（TrueType / 既存ページに近い文字間隔） ─────────────────────
GOTHIC_PATH = '/Library/Fonts/Microsoft/MS Gothic.ttf'
MINCHO_PATH = '/Library/Fonts/Microsoft/MS Mincho.ttf'
pdfmetrics.registerFont(TTFont('MSGothic', GOTHIC_PATH))
pdfmetrics.registerFont(TTFont('MSMincho', MINCHO_PATH))

G = 'MSGothic'   # ゴシック体（タイトル・メタ・URL・フッター）
M = 'MSMincho'   # 明朝体（本文）

PAGE_W, PAGE_H = A4
MAR = 20 * mm


def make_footer(page_number: int):
    """指定ページ番号を表示するフッター関数を返す"""
    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont(G, 8)
        canvas.setFillColor(colors.HexColor('#8AAAC8'))
        canvas.drawCentredString(
            PAGE_W / 2, 12 * mm,
            f'note 作品インデックス（作成日順）- {page_number} -'
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
        # ── 126番 ──────────────────────────────────────────────────────────
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
        # ── 127番 ──────────────────────────────────────────────────────────
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

    doc.build(story, onFirstPage=make_footer(page_number), onLaterPages=make_footer(page_number))
    return buf.getvalue()


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(base_dir, 'NoteIdx.pdf')

    reader = PdfReader(path)
    total = len(reader.pages)
    print(f'現行ページ数: {total}')

    # ページ0〜(total-2) を保持し、最終ページを新規生成版に差し替える
    keep_until = total - 1          # 16（最終ページ=index 16 を除く）
    new_page_number = keep_until + 1  # 17

    writer = PdfWriter()
    for i in range(keep_until):
        writer.add_page(reader.pages[i])

    combined = PdfReader(io.BytesIO(build_combined_last_page(new_page_number)))
    writer.add_page(combined.pages[0])

    with open(path, 'wb') as f:
        writer.write(f)

    print(f'NoteIdx.pdf 更新完了: 最終ページをTrueTypeフォントで再生成')
    print(f'ページ数: {total} ページ（変更なし）')
    print(f'出力先: {path}')


if __name__ == '__main__':
    main()
