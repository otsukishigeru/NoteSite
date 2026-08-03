#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
noteidx.pdf の重複項目とフォント不整合をまとめて修正する。

問題:
  - #130〜#134 が複数回重複して掲載されている
    （各追記スクリプトが「最終ページを1ページだけ差し替える」実装のため、
      最終ページ群が2ページ以上に伸びた時点から旧ページが残り続けた）
  - #126 以降が CID フォント（HeiseiKakuGo-W5 / HeiseiMin-W3）で、
    #1〜#125（TrueType: MS Gothic / MS Mincho）と字形・字間が異なる

方針:
  - index 0    = カバー（139件表記、内容は変更なし）
  - index 1〜15 = #1〜#125（変更なし、既存ページをそのまま流用）
  - index 16〜  = #126〜#139 を MS Gothic / MS Mincho で新規に一括再生成
                  （重複の原因だった「旧最終ページの残存」を断つ）
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

# カバー用（従来通り CID フォント）
pdfmetrics.registerFont(UnicodeCIDFont('HeiseiKakuGo-W5'))
pdfmetrics.registerFont(UnicodeCIDFont('HeiseiMin-W3'))
CG = 'HeiseiKakuGo-W5'
CM = 'HeiseiMin-W3'

# 項目本文用（#1〜#125 と同じ見た目に合わせるためプロポーショナル版を使用。
# 等幅の MS Gothic/MS Mincho だと英数字が全角相当の間延びした表示になるため MS PGothic/PMincho を採用）
GOTHIC_PATH = '/Library/Fonts/Microsoft/MS PGothic.ttf'
MINCHO_PATH = '/Library/Fonts/Microsoft/MS PMincho.ttf'
pdfmetrics.registerFont(TTFont('MSPGothic', GOTHIC_PATH))
pdfmetrics.registerFont(TTFont('MSPMincho', MINCHO_PATH))
G = 'MSPGothic'
M = 'MSPMincho'

PAGE_W, PAGE_H = A4
MAR = 20 * mm


def make_footer(base_page_number: int, font_name: str):
    def footer(canvas, doc):
        canvas.saveState()
        page_number = base_page_number + canvas.getPageNumber() - 1
        canvas.setFont(font_name, 8)
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
    cover_title = ParagraphStyle('ct', fontName=CG, fontSize=16, leading=26,
                                  alignment=1, spaceAfter=6 * mm,
                                  textColor=colors.HexColor('#1d2f5f'))
    cover_sub = ParagraphStyle('cs', fontName=CM, fontSize=10, leading=17,
                                alignment=1, textColor=colors.HexColor('#4E6A88'))
    story = [
        Spacer(1, 30 * mm),
        Paragraph('note 作品インデックス（作成日順）', cover_title),
        HRFlowable(width='80%', thickness=1.5,
                   color=colors.HexColor('#1d2f5f'), hAlign='CENTER'),
        Spacer(1, 4 * mm),
        Paragraph('1_s_o の note 作品を 139 件を作成日順に掲載します。', cover_sub),
        Spacer(1, 2 * mm),
        Paragraph('（第139番追記：2026 年 8 月 3 日）', cover_sub),
    ]
    footer = make_footer(1, CG)
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return buf.getvalue()


def make_entry(no_style, meta_style, url_style, body_style,
               num, title, date_heart, url, body):
    inner = [
        Paragraph(f'{num}. {title}', no_style),
        HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#1C3050')),
        Spacer(1, 1 * mm),
        Paragraph(f'作成日：{date_heart}', meta_style),
        Paragraph(f'URL：{url}', url_style),
        Paragraph(body, body_style),
        HRFlowable(width='100%', thickness=0.3, color=colors.HexColor('#1C3050')),
        Spacer(1, 4 * mm),
    ]
    return [KeepTogether(inner)]


def build_tail_pages(page_number: int) -> bytes:
    """#126〜#139 を MS Gothic / MS Mincho で新規生成する"""
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
    body_style = ParagraphStyle('bd', fontName=M, fontSize=9.5, leading=17,
                                 textColor=colors.HexColor('#1C1C1C'), spaceAfter=4 * mm)

    story = []

    story += make_entry(no_style, meta_style, url_style, body_style,
        126, 'ティール思想とアスケル思想の対比', '2026-04-03　♥ 0',
        'https://note.com/ichi_s_otsuki/n/nf18fe4ad69e7',
        'ピーター・ティールとアマンダ・アスケルの思想対比を通じ、'
        '「AIは人間の価値観の外にある力」vs'
        '「AIの価値観は設計可能であり設計する責任がある」という哲学的対立を考察。'
        '混迷する世界の中でAIテクノロジーの社会浸透の方向性を問う。'
    )

    story += make_entry(no_style, meta_style, url_style, body_style,
        127, 'AIトークンエコノミー　— 知働化サイトのコストモデル（AI-COCOMO）を事例として',
        '2026-04-13　♥ —',
        'https://note.com/ichi_s_otsuki/n/ne4028c50cfe9',
        'COCOMO II を生成AI時代に拡張したコストモデル「AI-COCOMO」を提案・解説する。'
        '知働化サイト（chidouka-lab.com）の実装データに基づき、'
        '従来型開発・現状AI支援・AI最大委任の3シナリオでコストを試算。'
        '¥1,475K → ¥326K → ¥115K と段階的に圧縮されることを示す。'
        'AIへの委任が増すほど人間の役割は「ビジョン定義・ドメイン判断・品質承認」に集中し、'
        'コスト構造が「作るコスト」から「確認するコスト」へ転換することを論じる。'
        'ファンクションポイント・KLOC・スケールファクタ・コストドライバ・AI代替率α・'
        'トークン単価・統合OH率δなど、全パラメータを定義した理論モデルを提示。'
        'なお、本論考をもとにしたWebシミュレータを chidouka-lab.com/AI-COCOMO/ で公開。'
    )

    story += make_entry(no_style, meta_style, url_style, body_style,
        128, '組織・システムの構造計算', '2026-04-21　♥ 1',
        'https://note.com/ichi_s_otsuki/n/ne5c487b3fad9',
        '建築における「構造計算」の概念を、現代の複雑化したITシステムや'
        '組織の設計・運用に応用する強力なメタファについて考察しています。'
        '一律の法的強制力を持たないIT業界において、システムのアーキテクチャ、'
        '運用、品質、プロセスを担保するための多様な標準規格（ISOやIEEEなど）の'
        '役割を概観しています。これらを踏まえ、複雑化するAI時代において、'
        '第三者視点からプロセスや構造の正しさを客観的に計測・評価し、'
        '信頼を構築する「構造計算経営」の重要性を提唱しています。'
    )

    story += make_entry(no_style, meta_style, url_style, body_style,
        129, 'AI・哲学の知政学', '2026-04-27　♥ –',
        'https://note.com/ichi_s_otsuki/n/n2631177010e4',
        '著名な思想家・研究者の哲学を、存在論的アプローチと認識論的アプローチの2軸で'
        '4象限にマッピングし、AIの立ち位置と人類の針路を整理する。'
        '知識やアルゴリズムの支配権闘争を「知政学」と位置づけ、'
        '私たちが未来を航海するための羅針盤として「知能の地図」を提示する論考。'
    )

    story += make_entry(no_style, meta_style, url_style, body_style,
        130, '思考の技法 2.0', '2026-05-10　♥ –',
        'https://note.com/ichi_s_otsuki/n/nb0eef1812e78',
        '前作『思考の技法』の課題と生成AIの急速な普及を踏まえ、AI時代におけるHI（人間知能）の役割を浮き彫りにする'
        '『思考の技法2.0』の脱稿とその構成を解説する。AI（思考モデル）とHI（思考）が協働する次世代のパラダイム像を描き出し、'
        '知識主導社会における新たな価値創造の方向性を提示。'
        '併せて、知働化コミュニティサイトを通じた本書の公開・販売の仕組みについても報告している。'
    )

    story += make_entry(no_style, meta_style, url_style, body_style,
        131, '思考の技法 2.0', '2026-05-11　♥ –',
        'https://note.com/ichi_s_otsuki/n/nc9259e103c5f',
        '『思考の技法２．０』への読者コメントを受け、AIエージェント内のモデル化（意味や文脈の階層）と、'
        'エージェント間のモデル化（「思考の社会」としての振る舞い）について深掘りする論考。'
        'AIの知能が集団知性に似た構造から生まれることを考察し、'
        '『思考の技法３．０』に向けた次なる探求の方向性を提示する。'
    )

    story += make_entry(no_style, meta_style, url_style, body_style,
        132, 'AI人材アセスメント', '2026-05-18　♥ –',
        'https://note.com/ichi_s_otsuki/n/na93ac576f509',
        '『思考の技法 2.0』に基づき、AI時代に求められる人材像を「成人発達理論」の観点から評価（アセスメント）する手法を解説する。'
        '採用面接や日常観察で応用できる具体的な判定基準（ルールの設計能力や認識する他者の範囲など）と質問例を実践的に提示している。'
        '陳腐化しやすいスキルではなく普遍的な能力を育成し、'
        '人間がAIの「コンダクター」として意味の創造に集中することの重要性を論じた論考。'
    )

    story += make_entry(no_style, meta_style, url_style, body_style,
        133, '知働化コミュニティへの転回', '2026-05-26　♥  3',
        'https://note.com/ichi_s_otsuki/n/n0aad8c53c12d',
        'アジャイルプロセス協議会の終了に伴い、知働化研究会が「知働化コミュニティ」として独立・転回する背景と今後の方向性を論じる。'
        '過去の活動の歩みを振り返りつつ、AIの進化を踏まえて「知働化」概念を再定義し、'
        'HIとAIの思考法や用法を探求する目的を提示する。'
        '個と組織の新たな世界観・価値観を示す、次なるコミュニティ活動の実践的展望。'
    )

    story += make_entry(no_style, meta_style, url_style, body_style,
        134, '自由エネルギー原理と『思考の技法 2.0』', '2026-06-05　♥  1',
        'https://note.com/ichi_s_otsuki/n/nf0120cd3f914',
        'カール・フリストンの「自由エネルギー原理」を『思考の技法』の視点から読み解き、'
        '脳の認識や意思決定の計算モデルとその哲学的背景を論じる。'
        '思考の技法の中心概念である「目的・コミュニケーション・抽象化」や、オートポイエーシス論との関連を再考している。'
        '脳科学の「大統一理論」が、今後のAIや組織・システム設計にもたらす新たな可能性を探求する実践的論考。'
    )

    story += make_entry(no_style, meta_style, url_style, body_style,
        135, '思考の技法 2.0 / 進化プロセス', '2026-06-28　♥  1',
        'https://note.com/ichi_s_otsuki/n/nad2408300e20',
        'AIを徹底活用するためのアーキテクチャとして、オントロジー（構造）、セマンティクス（意味）、エージェント（行為）の'
        '三層の分離と連結を提示する。人間の認識階層や自由エネルギー原理を評価プロセスに組み込み、自己評価'
        'を行う内省ループによって知識体系を自律的に改善・進化させる設計思想を論じる。'
        '静的な知識グラフと動的な推論を噛み合わせ、自己改善するシステムを構築するための実践的論考。'
    )

    story += make_entry(no_style, meta_style, url_style, body_style,
        136, 'ロボティクス・アーキテクチャの構想', '2026-07-09　♥  1',
        'https://note.com/ichi_s_otsuki/n/nbce4c5884cb7',
        '生成AIの実用化を前提とし、AIのフレーム問題への処方箋として「問題フレーム」を位置づけたロボットシステムの'
        '設計方法論を構想する。意味を扱う4層と時間スケールの3層制御、自由エネルギー原理の閉ループからなる'
        'アーキテクチャを提示。さらに、意図の定義から段階的進化に至る8ステップのデザイン技法を構成し、'
        '人間・AI・フレームの役割を整理する。'
    )

    story += make_entry(no_style, meta_style, url_style, body_style,
        137, 'ロボティクス・アーキテクチャの構想へのコメント', '2026-07-21　♥  1',
        'https://note.com/ichi_s_otsuki/n/nee399d526896',
        '「ロボティクス・アーキテクチャの構想」に寄せられた計8回のコメントへの見解と、それに伴う設計の改稿方針を統合した論考。'
        'AIと人間の役割分担の明確化や、エージェントに対し知識グラフを非公開（カプセル化）にする工学的な境界設計など、'
        '現実のスケールに耐えうる実装知見を提示している。'
        'さらに、記号的なオントロジーと連続的な世界モデルを潜在空間を介して動的に結合させる構成法など、'
        '自由エネルギー原理とも整合するアーキテクチャの精緻化について論じている。'
    )

    story += make_entry(no_style, meta_style, url_style, body_style,
        138, 'ロボティクス・アーキテクチャの構想：改訂版', '2026-07-21　♥  1',
        'https://note.com/ichi_s_otsuki/n/nee7edc6e64fb',
        '生成AIの実用化を前提に、AIのフレーム問題への処方箋として「問題フレーム」を位置づけたロボットシステムの'
        '設計方法論を構想する。意味を扱う4層と時間スケールの3層制御、自由エネルギー原理の閉ループからなる'
        'アーキテクチャを提示。意図の定義から段階的進化に至る8ステップのデザイン技法を構成し、'
        '人間・AI・フレームの役割を整理する。'
    )

    story += make_entry(no_style, meta_style, url_style, body_style,
        139, 'ラディカル・AI社会', '2026-08-03　♥  1',
        'https://note.com/ichi_s_otsuki/n/n0a6d6bb95e4c',
        '生成AIの発達による社会構造の変貌と、人財が「創造的カテゴリー」と「技能的カテゴリー」に二極化していく原理を'
        '『思考の技法 2.0』に基づき急進的（ラディカル）な視点で考察する。'
        '自動化・機械化により技能的作業がAIに代替される中、'
        '新しい価値や「目的」を創造するイノベーションこそが人間に残された役割であると提示する論考。'
    )

    footer = make_footer(page_number, G)
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return buf.getvalue()


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    src  = os.path.join(base_dir, 'noteidx.pdf')
    dest = os.path.join(base_dir, 'noteidx.pdf')

    reader = PdfReader(src)
    total = len(reader.pages)
    print(f'入力ページ数: {total}')

    writer = PdfWriter()

    # 1. 新カバーページ
    cover_pdf = PdfReader(io.BytesIO(build_cover_pdf()))
    writer.add_page(cover_pdf.pages[0])

    # 2. index 1〜15：#1〜#125 をそのまま保持（重複・フォント問題の影響なし）
    for i in range(1, 16):
        writer.add_page(reader.pages[i])

    # 3. #126〜#139 を MS Gothic / MS Mincho で新規に一括再生成
    tail_pdf = PdfReader(io.BytesIO(build_tail_pages(page_number=17)))
    for page in tail_pdf.pages:
        writer.add_page(page)

    out_buf = io.BytesIO()
    writer.write(out_buf)

    with open(dest, 'wb') as f:
        f.write(out_buf.getvalue())

    total_out = 1 + 15 + len(tail_pdf.pages)
    print(f'noteidx.pdf 修正完了: {total_out} ページ')
    print(f'出力先: {dest}')


if __name__ == '__main__':
    main()
