#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
noteidx_previous2.pdf に #130 エントリを追加して noteidx.pdf を生成する
  1. 新カバーページ（全 130 件）を生成
  2. 既存ページ 2〜16（記事 1〜125）をそのまま保持
  3. 最終ページ（126〜129）を再生成し 130 を追記
  4. pypdf で結合して noteidx.pdf として保存
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
from pypdf import PdfReader, PdfWriter

pdfmetrics.registerFont(UnicodeCIDFont('HeiseiKakuGo-W5'))
pdfmetrics.registerFont(UnicodeCIDFont('HeiseiMin-W3'))
G = 'HeiseiKakuGo-W5'
M = 'HeiseiMin-W3'

PAGE_W, PAGE_H = A4
MAR = 20 * mm


def make_footer(page_number: int):
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


def build_cover_pdf() -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                             leftMargin=MAR, rightMargin=MAR,
                             topMargin=MAR, bottomMargin=18 * mm)
    cover_title = ParagraphStyle('ct', fontName=G, fontSize=16, leading=26,
                                  alignment=1, spaceAfter=6 * mm,
                                  textColor=colors.HexColor('#1d2f5f'))
    cover_sub = ParagraphStyle('cs', fontName=M, fontSize=10, leading=17,
                                alignment=1, textColor=colors.HexColor('#4E6A88'))
    story = [
        Spacer(1, 30 * mm),
        Paragraph('note 作品インデックス（作成日順）', cover_title),
        HRFlowable(width='80%', thickness=1.5,
                   color=colors.HexColor('#1d2f5f'), hAlign='CENTER'),
        Spacer(1, 4 * mm),
        Paragraph('1_s_o の note 作品 全 130 件を作成日順に掲載します。', cover_sub),
        Spacer(1, 2 * mm),
        Paragraph('（第130番追記：2026 年 5 月 10 日）', cover_sub),
    ]
    doc.build(story, onFirstPage=make_footer(1), onLaterPages=make_footer(1))
    return buf.getvalue()


def make_entry(no_style, meta_style, url_style, body_style,
               num, title, date_heart, url, body,
               last=False, keep_together=False):
    inner = [
        Paragraph(f'{num}. {title}', no_style),
        HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#1C3050')),
        Spacer(1, 1 * mm),
        Paragraph(f'作成日：{date_heart}', meta_style),
        Paragraph(f'URL：{url}', url_style),
        Paragraph(body, body_style),
        HRFlowable(width='100%', thickness=0.3, color=colors.HexColor('#1C3050')),
    ]
    if not last:
        inner.append(Spacer(1, 4 * mm))
    if keep_together:
        return [KeepTogether(inner)]
    return inner


def build_last_page(page_number: int) -> bytes:
    """126〜130番を含む最終ページのPDFをバイト列で返す"""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                             leftMargin=MAR, rightMargin=MAR,
                             topMargin=MAR, bottomMargin=18 * mm)

    no_style   = ParagraphStyle('no', fontName=G, fontSize=11, leading=18,
                                 textColor=colors.HexColor('#1d2f5f'), spaceAfter=1 * mm)
    meta_style = ParagraphStyle('mt', fontName=G, fontSize=9, leading=14,
                                 textColor=colors.HexColor('#4E6A88'), spaceAfter=1 * mm)
    url_style  = ParagraphStyle('ur', fontName=G, fontSize=9, leading=14,
                                 textColor=colors.HexColor('#5BA4CF'), spaceAfter=2 * mm)
    body_style = ParagraphStyle('bd', fontName=M, fontSize=9, leading=17,
                                 textColor=colors.HexColor('#1C1C1C'), spaceAfter=4 * mm)

    story = []

    # 126
    story += make_entry(no_style, meta_style, url_style, body_style,
        126,
        'ティール思想とアスケル思想の対比',
        '2026-04-03　♥ 0',
        'https://note.com/ichi_s_otsuki/n/nf18fe4ad69e7',
        'ピーター・ティールとアマンダ・アスケルの思想対比を通じ、'
        '「AIは人間の価値観の外にある力」vs'
        '「AIの価値観は設計可能であり設計する責任がある」'
        'という哲学的対立を考察。'
        '混迂する世界の中AIテクノロジーの社会洸透の方向性を問う。'
    )

    # 127
    story += make_entry(no_style, meta_style, url_style, body_style,
        127,
        'AIトークンエコノミー　― 知働化サイトのコストモデル（AI-COCOMO）を事例として',
        '2026-04-13　♥ ―',
        'https://note.com/ichi_s_otsuki/n/ne4028c50cfe9',
        'COCOMO II を生成AI時代に拡張したコストモデル「AI-COCOMO」を提案・解説する。'
        '知働化サイト（chidouka-lab.com）の実装データに基づき、'
        '従来型開発・現状AI支援・AI最大委任の3シナリオでコストを試算。'
        '\xa51,475K → \xa5326K → \xa5115K と段階的に圧縮されることを示す。'
        'AIへの委任が増すほど人間の役割は「ビジョン定義・ドメイン判断・品質承認」に集中し、'
        'コスト構造が「作るコスト」から「確認するコスト」へ転換することを論じる。'
        'ファンクションポイント・KLOC・スケールファクタ・コストドライバ・AI代替率α・'
        'トークン単価・統合OH率δなど、全パラメータを定義した理論モデルを提示。'
        'なお、本論考をもとにしたWebシミュレータを chidouka-lab.com/AI-COCOMO/ で公開。'
    )

    # 128
    story += make_entry(no_style, meta_style, url_style, body_style,
        128,
        '組織・システムの構造計算',
        '2026-04-21　♥ 1',
        'https://note.com/ichi_s_otsuki/n/ne5c487b3fad9',
        '建築における「構造計算」の概念を、現代の複雑化したITシステムや組織の設計・運用に応用する'
        '強力なメタファについて考察しています。一律の法的強制力を持たなIT業界において、'
        'システムのアーキテクチャ、運用、品質、プロセスを担保するための多様な標準規格'
        '（ISOやIEEEなど）の役割を概観しています。これらを踏まえ、複雑化するAI時代において、'
        '第三者視点からプロセスや構造の正しさを客観的に計測・評価し、信頼を構築する'
        '「構造計算経営」の重要性を提唱しています。'
    )

    # 129
    story += make_entry(no_style, meta_style, url_style, body_style,
        129,
        'AI・哲学の知政学',
        '2026-04-27　♥ ‒',
        'https://note.com/ichi_s_otsuki/n/n2631177010e4',
        '著名な思想家・研究者の哲学を、存在論的アプローチと認識論的アプローチの2軸で4象限にマッピングし、'
        'AIの立ち位置と人類の針路を整理する。知識やアルゴリズムの支配権闘争を「知政学」と位置づけ、'
        '私たちが未来を航海するための羅針盤として「知能の地図」を提示する論考。'
    )

    # 130（新規追記）— KeepTogether で途中改ページを防ぐ
    story += make_entry(no_style, meta_style, url_style, body_style,
        130,
        '思考の技法 2.0',
        '2026-05-10　♥ –',
        'https://note.com/ichi_s_otsuki/n/nb0eef1812e78',
        '前作『思考の技法』の課題と生成AIの急速な普及を踏まえ、'
        'AI時代におけるHI（人間知能）の役割を浮き彫りにする'
        '『思考の技法2.0』の脱稿とその構成を解説する。'
        'AI（思考モデル）とHI（思考）が協働する次世代のパラダイム像を描き出し、'
        '知識主導社会における新たな価値創造の方向性を提示。'
        '併せて、知働化コミュニティサイトを通じた本書の公開・販売の仕組みについても報告している。',
        last=True,
        keep_together=True
    )

    doc.build(story,
              onFirstPage=make_footer(page_number),
              onLaterPages=make_footer(page_number + 1))
    return buf.getvalue()


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    src  = os.path.join(base_dir, 'noteidx_previous2.pdf')
    dest = os.path.join(base_dir, 'noteidx.pdf')

    reader = PdfReader(src)
    total  = len(reader.pages)
    print(f'入力ページ数: {total}')

    writer = PdfWriter()

    # 1. 新カバーページ（130件表記）
    cover_pdf = PdfReader(io.BytesIO(build_cover_pdf()))
    writer.add_page(cover_pdf.pages[0])

    # 2. 既存ページ index 1〜(total-2)：記事 1〜125 をそのまま保持
    for i in range(1, total - 1):
        writer.add_page(reader.pages[i])

    # 3. 最終ページを再生成（126〜130）
    last_pdf   = PdfReader(io.BytesIO(build_last_page(page_number=total)))
    last_pages = len(last_pdf.pages)
    for page in last_pdf.pages:
        writer.add_page(page)

    with open(dest, 'wb') as f:
        writer.write(f)

    total_out = total - 1 + last_pages
    print(f'noteidx.pdf 生成完了: {total_out} ページ')
    print(f'出力先: {dest}')


if __name__ == '__main__':
    main()
