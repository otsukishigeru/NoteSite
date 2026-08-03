#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
noteidx_previous9.pdf に #137 エントリを追加して noteidx_previous10.pdf を生成する
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


def make_footer(base_page_number: int):
    def footer(canvas, doc):
        canvas.saveState()
        page_number = base_page_number + canvas.getPageNumber() - 1
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
        Paragraph('1_s_o の note 作品を 137 件を作成日順に掲載します。', cover_sub),
        Spacer(1, 2 * mm),
        Paragraph('（第137番追記：2026 年 7 月 21 日）', cover_sub),
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
    """130〜137番を含む最終ページ群のPDFをバイト列で返す"""
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

    # 130
    story += make_entry(no_style, meta_style, url_style, body_style,
        130, '思考の技法 2.0', '2026-05-10　♥ –',
        'https://note.com/ichi_s_otsuki/n/nb0eef1812e78',
        '前作『思考の技法』の課題と生成AIの急速な普及を踏まえ、AI時代におけるHI（人間知能）の役割を浮き彫りにする'
        '『思考の技法2.0』の脱稿とその構成を解説する。AI（思考モデル）とHI（思考）が協働する次世代のパラダイム像を描き出し、'
        '知識主導社会における新たな価値創造の方向性を提示。'
        '併せて、知働化コミュニティサイトを通じた本書の公開・販売の仕組みについても報告している。'
    )

    # 131
    story += make_entry(no_style, meta_style, url_style, body_style,
        131, '思考の技法 2.0', '2026-05-11　♥ –',
        'https://note.com/ichi_s_otsuki/n/nc9259e103c5f',
        '『思考の技法２．０』への読者コメントを受け、AIエージェント内のモデル化（意味や文脈の階層）と、'
        'エージェント間のモデル化（「思考の社会」としての振る舞い）について深掘りする論考。'
        'AIの知能が集団知性に似た構造から生まれることを考察し、'
        '『思考の技法３．０』に向けた次なる探求の方向性を提示する。'
    )

    # 132
    story += make_entry(no_style, meta_style, url_style, body_style,
        132, 'AI人材アセスメント', '2026-05-18　♥ –',
        'https://note.com/ichi_s_otsuki/n/na93ac576f509',
        '『思考の技法 2.0』に基づき、AI時代に求められる人材像を「成人発達理論」の観点から評価（アセスメント）する手法を解説する。'
        '採用面接や日常観察で応用できる具体的な判定基準（ルールの設計能力や認識する他者の範囲など）と質問例を実践的に提示している。'
        '陳腐化しやすいスキルではなく普遍的な能力を育成し、'
        '人間がAIの「コンダクター」として意味の創造に集中することの重要性を論じた論考。'
    )

    # 133
    story += make_entry(no_style, meta_style, url_style, body_style,
        133, '知働化コミュニティへの転回', '2026-05-26　♥  3',
        'https://note.com/ichi_s_otsuki/n/n0aad8c53c12d',
        'アジャイルプロセス協議会の終了に伴い、知働化研究会が「知働化コミュニティ」として独立・転回する背景と今後の方向性を論じる。'
        '過去の活動の歩みを振り返りつつ、AIの進化を踏まえて「知働化」概念を再定義し、'
        'HIとAIの思考法や用法を探求する目的を提示する。'
        '個と組織の新たな世界観・価値観を示す、次なるコミュニティ活動の実践的展望。'
    )

    # 134
    story += make_entry(no_style, meta_style, url_style, body_style,
        134, '自由エネルギー原理と『思考の技法 2.0』', '2026-06-05　♥  1',
        'https://note.com/ichi_s_otsuki/n/nf0120cd3f914',
        'カール・フリストンの「自由エネルギー原理」を『思考の技法』の視点から読み解き、'
        '脳の認識や意思決定の計算モデルとその哲学的背景を論じる。'
        '思考の技法の中心概念である「目的・コミュニケーション・抽象化」や、オートポイエーシス論との関連を再考している。'
        '脳科学の「大統一理論」が、今後のAIや組織・システム設計にもたらす新たな可能性を探求する実践的論考。'
    )

    # 135
    story += make_entry(no_style, meta_style, url_style, body_style,
        135, '思考の技法 2.0 / 進化プロセス', '2026-06-28　♥  1',
        'https://note.com/ichi_s_otsuki/n/nad2408300e20',
        'AIを徹底活用するためのアーキテクチャとして、オントロジー（構造）、セマンティクス（意味）、エージェント（行為）の'
        '三層の分離と連結を提示する。人間の認識階層や自由エネルギー原理を評価プロセスに組み込み、自己評価'
        'を行う内省ループによって知識体系を自律的に改善・進化させる設計思想を論じる。'
        '静的な知識グラフと動的な推論を噛み合わせ、自己改善するシステムを構築するための実践的論考。'
    )

    # 136
    story += make_entry(no_style, meta_style, url_style, body_style,
        136, 'ロボティクス・アーキテクチャの構想', '2026-07-09　♥  1',
        'https://note.com/ichi_s_otsuki/n/nbce4c5884cb7',
        '生成AIの実用化を前提とし、AIのフレーム問題への処方箋として「問題フレーム」を位置づけたロボットシステムの'
        '設計方法論を構想する。意味を扱う4層と時間スケールの3層制御、自由エネルギー原理の閉ループからなる'
        'アーキテクチャを提示。さらに、意図の定義から段階的進化に至る8ステップのデザイン技法を構成し、'
        '人間・AI・フレームの役割を整理する。'
    )

    # 137（新規追記）— KeepTogether で途中改ページを防ぐ。
    # 136番の直後に収まらない場合は自動的に改ページされる。
    story += make_entry(no_style, meta_style, url_style, body_style,
        137, 'ロボティクス・アーキテクチャの構想へのコメント', '2026-07-21　♥  1',
        'https://note.com/ichi_s_otsuki/n/nee399d526896',
        '「ロボティクス・アーキテクチャの構想」に寄せられた計8回のコメントへの見解と、それに伴う設計の改稿方針を統合した論考。'
        'AIと人間の役割分担の明確化や、エージェントに対し知識グラフを非公開（カプセル化）にする工学的な境界設計など、'
        '現実のスケールに耐えうる実装知見を提示している。'
        'さらに、記号的なオントロジーと連続的な世界モデルを潜在空間を介して動的に結合させる構成法など、'
        '自由エネルギー原理とも整合するアーキテクチャの精緻化について論じている。',
        last=True,
        keep_together=True
    )

    footer = make_footer(page_number)
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return buf.getvalue()


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    src  = os.path.join(base_dir, 'noteidx_previous9.pdf')
    dest = os.path.join(base_dir, 'noteidx_previous10.pdf')

    reader = PdfReader(src)
    total  = len(reader.pages)
    print(f'入力ページ数: {total}')

    writer = PdfWriter()

    # 1. 新カバーページ（137件表記）
    cover_pdf = PdfReader(io.BytesIO(build_cover_pdf()))
    writer.add_page(cover_pdf.pages[0])

    # 2. 既存ページ index 1〜(total-2)：記事 1〜129 をそのまま保持
    for i in range(1, total - 1):
        writer.add_page(reader.pages[i])

    # 3. 最終ページを再生成（130〜137）
    last_pdf   = PdfReader(io.BytesIO(build_last_page(page_number=total)))
    last_pages = len(last_pdf.pages)
    for page in last_pdf.pages:
        writer.add_page(page)

    with open(dest, 'wb') as f:
        writer.write(f)

    total_out = total - 1 + last_pages
    print(f'{os.path.basename(dest)} 生成完了: {total_out} ページ')
    print(f'出力先: {dest}')


if __name__ == '__main__':
    main()
