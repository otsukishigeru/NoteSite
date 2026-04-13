#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NoteIdx.pdf に #127 エントリを追加するスクリプト
  1. 既存 NoteIdx.pdf のページ2以降（記事一覧）を保持
  2. 新しいカバーページ（全 127 件）を reportlab で生成
  3. #127 エントリページを追加
  4. pypdf で結合
"""

import io, os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, HRFlowable)
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

def make_style(name, **kw):
    return ParagraphStyle(name, **kw)

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont(G, 8)
    canvas.setFillColor(colors.HexColor('#8AAAC8'))
    canvas.drawCentredString(PAGE_W/2, 12*mm, f'note 作品インデックス（作成日順）- {doc.page} -')
    canvas.restoreState()

def build_cover_pdf() -> bytes:
    """カバーページのみのPDFをバイト列で返す"""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                             leftMargin=MAR, rightMargin=MAR,
                             topMargin=MAR, bottomMargin=18*mm)
    cover_title = make_style('ct', fontName=G, fontSize=16, leading=26,
                              alignment=1, spaceAfter=6*mm,
                              textColor=colors.HexColor('#1d2f5f'))
    cover_sub   = make_style('cs', fontName=M, fontSize=10, leading=17,
                              alignment=1, textColor=colors.HexColor('#4E6A88'))
    story = [
        Spacer(1, 30*mm),
        Paragraph('note 作品インデックス（作成日順）', cover_title),
        HRFlowable(width='80%', thickness=1.5,
                   color=colors.HexColor('#1d2f5f'), hAlign='CENTER'),
        Spacer(1, 4*mm),
        Paragraph('1_s_o の note 作品 全 127 件を作成日順に掲載します。', cover_sub),
        Spacer(1, 2*mm),
        Paragraph('（第127番追記：2026 年 4 月 13 日）', cover_sub),
    ]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return buf.getvalue()

def build_entry127_pdf() -> bytes:
    """#127 エントリページのみのPDFをバイト列で返す"""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                             leftMargin=MAR, rightMargin=MAR,
                             topMargin=MAR, bottomMargin=18*mm)

    no_style   = make_style('no', fontName=G, fontSize=11, leading=18,
                             textColor=colors.HexColor('#1d2f5f'),
                             spaceAfter=1*mm)
    meta_style = make_style('mt', fontName=G, fontSize=9, leading=14,
                             textColor=colors.HexColor('#4E6A88'),
                             spaceAfter=1*mm)
    url_style  = make_style('ur', fontName=G, fontSize=9, leading=14,
                             textColor=colors.HexColor('#5BA4CF'),
                             spaceAfter=2*mm)
    body_style = make_style('bd', fontName=M, fontSize=9.5, leading=17,
                             textColor=colors.HexColor('#1C1C1C'),
                             spaceAfter=4*mm)

    story = [
        Paragraph('127. AI トークンエコノミー'
                  '　— 知働化サイトのコストモデル（AI-COCOMO）を事例として', no_style),
        HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#1C3050')),
        Spacer(1, 1*mm),
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
            body_style),
        HRFlowable(width='100%', thickness=0.3, color=colors.HexColor('#1C3050')),
    ]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return buf.getvalue()

def main():
    base_dir = os.path.dirname(__file__)
    src  = os.path.join(base_dir, 'NoteIdx.pdf')
    dest = os.path.join(base_dir, 'NoteIdx.pdf')

    # 既存PDFのページ2以降を取得（ページ0=カバー、ページ1〜=記事一覧）
    reader = PdfReader(src)
    total  = len(reader.pages)
    print(f'既存ページ数: {total}')

    writer = PdfWriter()

    # 1. 新カバーページ
    cover_pdf = PdfReader(io.BytesIO(build_cover_pdf()))
    writer.add_page(cover_pdf.pages[0])

    # 2. 既存ページ 2〜最終（カバー除く）
    for i in range(1, total):
        writer.add_page(reader.pages[i])

    # 3. #127 エントリページ
    entry_pdf = PdfReader(io.BytesIO(build_entry127_pdf()))
    writer.add_page(entry_pdf.pages[0])

    with open(dest, 'wb') as f:
        writer.write(f)
    print(f'NoteIdx.pdf 更新完了: {total+1} ページ → {dest}')

if __name__ == '__main__':
    main()
