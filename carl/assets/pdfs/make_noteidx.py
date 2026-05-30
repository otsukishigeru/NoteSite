#!/usr/bin/env python3
# make_noteidx.py — noteidx.pdf (15件版) を生成する
# 実行: python3 make_noteidx.py

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors

# ── フォント登録 ──────────────────────────────────────
pdfmetrics.registerFont(TTFont('MSGothic',  '/Library/Fonts/Microsoft/MS Gothic.ttf'))
pdfmetrics.registerFont(TTFont('MSPGothic', '/Library/Fonts/Microsoft/MS PGothic.ttf'))

# ── ページ設定 ────────────────────────────────────────
PAGE_W, PAGE_H = A4          # 595.3 × 841.9
MARGIN_L = 76.87
MARGIN_R = PAGE_W - 56
MARGIN_T = 56
MARGIN_B = 56                # footer 上端の余白
FOOTER_Y = 26                # ページ番号 y 座標
TEXT_W   = MARGIN_R - MARGIN_L

# ── 記事データ ────────────────────────────────────────
articles = [
    {
        "num": "001",
        "title": '哲学×AI：哲学的思考とAIの進化から再び“意識”を考える',
        "date": "2025-08-07", "like": "3",
        "url": "https://note.com/carl/n/n5443f07c0613",
        "desc": (
            "著者は大学時代に意識の本質について深く思索していたが、AIの驚異的な進化を目の当たり"
            "にし、「AIはもはや単なるツール」ではなく創造性に挑む存在として認識されるように"
            "なった。かつての哲学的な問い——「意識とは何か」——を改めて問い直す試みとなっている。"
        ),
    },
    {
        "num": "002",
        "title": "「経験するAI」とエナクティヴィズム──知能の未来をめぐる交差点",
        "date": "2025-08-07", "like": "3",
        "url": "https://note.com/carl/n/n8cb0445bac18",
        "desc": (
            "2025年4月、強化学習の権威による論文「経験の時代へようこそ」が発表された。AIは従"
            "来のデータ解析から「自ら世界と関わり経験を通じて学ぶ」存在へと進化しようとしてい"
            "る。この変化は認知科学のエナクティヴィズム思想と深く共鳴しており、知能の未来に新"
            "たな地平が開かれつつある。"
        ),
    },
    {
        "num": "003",
        "title": "デカルトから現代までの心の哲学史 ― 現象学と分析哲学の交差点に立つ（前編）",
        "date": "2025-08-23", "like": "4",
        "url": "https://note.com/carl/n/n1d1e7ad0d554",
        "desc": (
            "17世紀のデカルトの二元論から、カントの認識論的転回、フッサールの現象学まで、「心"
            "とは何か」という問いが時代とともにどう変化したかを検証する。現象学と分析哲学とい"
            "う現代哲学の二大潮流の出発点を理解することで、現代の「心」概念の基盤が明らかにな"
            "る。"
        ),
    },
    {
        "num": "004",
        "title": "デカルトから現代までの心の哲学史 ― 現象学と分析哲学の交差点に立つ（後編）",
        "date": "2025-08-23", "like": "8",
        "url": "https://note.com/carl/n/ne45bbd1283e4",
        "desc": (
            "20世紀後半、断絶していた現象学（ヨーロッパ）と分析哲学（英米）は、意識研究やAIの"
            "発展を契機に歩み寄りを始めた。21世紀にはオートポイエーシスやエナクティヴィズムと"
            "いった新しい理論的枠組みが登場し、両派の統合を促す潮流が形成されつつある。"
        ),
    },
    {
        "num": "005",
        "title": "道具から協働者へ：System 0で組み直す人×AIの思考プロセス（前編）",
        "date": "2025-09-20", "like": "1",
        "url": "https://note.com/carl/n/n9ce94387fa44",
        "desc": (
            "検索やレコメンド、生成AIは情報の輪郭と入り口を事前に編集する「System 0」として機"
            "能しており、カーネマンの二重過程理論のシステム1・2の前段階で働いている。拡張され"
            "た心（Extended Mind）の観点からAIが「外部の道具」から「心の構成要素」へ近づく条"
            "件を検討する。"
        ),
    },
    {
        "num": "006",
        "title": "道具から協働者へ：System 0で組み直す人×AIの思考プロセス（後編）",
        "date": "2025-09-20", "like": "1",
        "url": "https://note.com/carl/n/na565c90d7012",
        "desc": (
            "前編で示したExtended Mindの条件を踏まえ、AIが拡張認知のメリットをもたらす一方で"
            "迎合やバイアス増幅による視野狭窄の罠に陥るパラドックスを指摘する。人間の主体的思"
            "考力を保ちながらAIと協働するための「七つの設計フレーム」を提示する。"
        ),
    },
    {
        "num": "007",
        "title": "「知」から「心」へ：IT技術者のための哲学思想史入門",
        "date": "2025-10-09", "like": "7",
        "url": "https://note.com/carl/n/n5f30cd617f81",
        "desc": (
            "哲学の探究焦点は時代とともに変遷してきたが、この変遷がIT開発における要件定義の進"
            "化と驚くほど似ていると著者は指摘する。「知識とは何か」という認識論的問いから「心"
            "とは何か」という意識の本質へと移行する歴史的流れが、現代のAI技術やシステム設計の"
            "課題と深く結びついている。"
        ),
    },
    {
        "num": "008",
        "title": "（改訂版）道具から協働者へ：System 0で組み直す人×AIの思考プロセス",
        "date": "2025-11-06", "like": "3",
        "url": "https://note.com/carl/n/nc8c7713110c0",
        "desc": (
            "AIを「便利な道具」ではなく「認知的パートナー」として位置づける「System 0」という"
            "新しい概念を提唱する。従来のSystem 1（直感的思考）とSystem 2（論理的思考）の枠組"
            "みを超えて、AIとの協働により人間中心的な思考プロセスを構築できるという主張を展開。"
            "AIアプリ開発者向けの実用的な設計原則を示す。"
        ),
    },
    {
        "num": "009",
        "title": "クオリアをめぐる哲学的探求：意識の謎に迫る",
        "date": "2025-12-14", "like": "8",
        "url": "https://note.com/carl/n/nd3e57c98fe37",
        "desc": (
            "「赤い花の美しさ」や「コーヒーの香り」といった感覚には、単なる情報処理を超えた主"
            "観的な「感じ」が存在する。この「質感」をクオリアと呼ぶ。客観的な科学的探究に対す"
            "る根本的な課題を提示するクオリアという概念について、哲学的な主要論点と対立する思"
            "想的立場を分かりやすく解説する。"
        ),
    },
    {
        "num": "010",
        "title": "「私」の感覚はどこから来るのか？ —— 脳科学と数学が挑む「意識」という最後の謎",
        "date": "2026-01-19", "like": "5",
        "url": "https://note.com/carl/n/nbb758b30d31c",
        "desc": (
            "「青色を見るとき、私が感じる青はあなたが感じる青と同じか」という根本的な問いから"
            "出発する。言葉では説明しがたい主観的体験「クオリア」の謎に、脳科学と数学がどのよ"
            "うにアプローチするかを探る。意識がいかに脳から生じるのかという哲学と科学の交差点"
            "にある最後の謎に迫る。"
        ),
    },
    {
        "num": "011",
        "title": "意識の地図を歩く —— 物理学から神秘まで、私たちはどこまで解明できたのか？",
        "date": "2026-01-20", "like": "9",
        "url": "https://note.com/carl/n/n640b4e4fbe2e",
        "desc": (
            "「読んでいる」という主観的体験がいかに生成されるのかという問いを中心に展開する。"
            "脳という物質から意識が生じるメカニズムは現代科学の最大の謎の一つ。デイヴィッド・"
            "チャーマーズ等の哲学者による問題提起を含め、物理学から神秘領域まで多角的な観点か"
            "ら意識の本質に迫る。"
        ),
    },
    {
        "num": "012",
        "title": "あなたの「青」と私の「青」は同じ？——「クオリア周期表」を作る挑戦が始まった",
        "date": "2026-02-11", "like": "2",
        "url": "https://note.com/carl/n/n872012f34a4d",
        "desc": (
            "統合情報理論（IIT）と圏論という二つの手法を踏まえ、個人差のある「色の見え方」と"
            "いう問題を通じて意識の本質に迫る。「クオリア周期表」という新しい概念的枠組みを構"
            "築し、意識を「情報統合の度合い」と「関係性の網」という観点から捉え直す挑戦を展開"
            "する。"
        ),
    },
    {
        "num": "013",
        "title": "機械に『環世界』は宿るか？：ユクスキュルと4E認知から考える次世代AIの設計図",
        "date": "2026-03-19", "like": "2",
        "url": "https://note.com/carl/n/n13480d742ed8",
        "desc": (
            "現在のAIは統計的な単語の関連性にしか基づかず、身体を通じた感覚経験の結びつきが欠"
            "落している。哲学者ユクスキュルの「環世界」概念と4E認知科学（身体化・環境埋め込み・"
            "拡張・自己遍在的認知）を援用し、機械に主観的な現実認識を備えさせる次世代AI設計の"
            "可能性を探る。"
        ),
    },
    {
        "num": "014",
        "title": "「心は脳の中だけにある」のか——身体化された認知から考える、身体と世界の関係",
        "date": "2026-04-16", "like": "2",
        "url": "https://note.com/carl/n/ne57c052c3301",
        "desc": (
            "心は脳内で完結するのかという「水槽の中の脳」の思考実験から出発し、『現象学的な心』第"
            "7章を手がかりに身体化された認知について考察している。直立二足歩行や「生きられた身体」"
            "の概念、さらに道具や他者へと拡張される心のあり方を探り、心身二元論を乗り越えて身体"
            "と世界の関係を捉え直す試みとなっている。"
        ),
    },
    {
        "num": "015",
        "title": "【高校生でもわかる！？】脳と生命の「大統一理論」！？自由エネルギー原理を世界一わかりやすく解説してみた",
        "date": "2026-05-28", "like": "1",
        "url": "https://note.com/carl/n/n30efd15d0ea0",
        "desc": (
            "カール・フリストンが提唱した難解な「自由エネルギー原理」を、高校生でも直感的に理解"
            "できるようスライド形式で要約した解説記事です。知覚や行動といった脳の複雑な働きが、"
            "予測不可能な「驚き（サプライズ）」を最小化するというたった一つの目的に従っているこ"
            "とを説明しています。生命と脳の壮大なメカニズムの全体像をざっくりと把握できる内容と"
            "なっています。"
        ),
    },
]


# ── テキスト折り返し ──────────────────────────────────
def wrap_text(c, text, font, size, max_width):
    """文字列を max_width に収まるように折り返す。行リストを返す。"""
    c.setFont(font, size)
    lines = []
    current = ""
    for ch in text:
        test = current + ch
        if c.stringWidth(test, font, size) > max_width:
            lines.append(current)
            current = ch
        else:
            current = test
    if current:
        lines.append(current)
    return lines


# ── 記事1件を描画し、使用した高さを返す ────────────────
def draw_article(c, article, y_top, page_bottom, font_title, font_body,
                 size_title, size_meta, size_desc, leading_title,
                 leading_meta, leading_desc):
    """
    y_top から下方向に記事を描画する。
    y_top, page_bottom はページ座標（上原点ではなく下原点）。
    戻り値: (最終的な y 座標, 収まったか否か)
    """
    num   = article["num"]
    title = article["title"]
    date  = article["date"]
    like  = article["like"]
    url   = article["url"]
    desc  = article["desc"]

    # タイトル折り返し
    title_lines = wrap_text(c, f"{num}. {title}", font_title, size_title, TEXT_W)
    # 説明文折り返し
    desc_lines  = wrap_text(c, desc, font_body, size_desc, TEXT_W)

    # 高さ計算
    h_title = len(title_lines) * leading_title
    h_meta  = leading_meta * 2   # 作成日行 + URL行
    h_desc  = len(desc_lines) * leading_desc
    h_total = h_title + h_meta + h_desc + 6  # 余白

    if y_top - h_total < page_bottom:
        return y_top, False  # 収まらない

    y = y_top

    # タイトル描画
    c.setFont(font_title, size_title)
    c.setFillColor(colors.black)
    for line in title_lines:
        c.drawString(MARGIN_L, y, line)
        y -= leading_title

    y -= 4  # タイトル後の小スペース

    # 作成日・いいね
    c.setFont(font_body, size_meta)
    c.drawString(MARGIN_L, y, f"作成日：{date}  ♥ {like}")
    y -= leading_meta

    # URL
    c.setFont(font_body, size_meta)
    c.drawString(MARGIN_L, y, f"URL：{url}")
    y -= leading_meta + 6

    # 説明文
    c.setFont(font_body, size_desc)
    for line in desc_lines:
        c.drawString(MARGIN_L, y, line)
        y -= leading_desc

    return y, True


# ── PDF 生成 ─────────────────────────────────────────
def build_pdf(output_path):
    c = canvas.Canvas(output_path, pagesize=A4)

    font_title  = 'MSPGothic'
    font_body   = 'MSGothic'
    size_h1     = 24
    size_h2     = 11
    size_title  = 15
    size_meta   = 10
    size_desc   = 11
    lead_title  = 22
    lead_meta   = 17
    lead_desc   = 20

    page_num    = 1
    item_idx    = 0

    # ───── ページ1：ヘッダー付き ─────
    # ヘッダー
    y = PAGE_H - MARGIN_T
    c.setFont(font_title, size_h1)
    c.setFillColor(colors.black)
    c.drawString(MARGIN_L, y, "note 作品インデックス（作成日順）")
    y -= size_h1 + 10

    # 下線
    c.setLineWidth(0.8)
    c.line(MARGIN_L, y + 4, MARGIN_R, y + 4)
    y -= 14

    # サブタイトル
    c.setFont(font_body, size_h2)
    c.drawString(MARGIN_L, y, "t0rapa(carl)氏の作品15件を作成日順に掲載します。（第15番追記：2026年5月28日）")
    y -= size_h2 + 20

    page_bottom = MARGIN_B + 20  # footer 用余白

    # 記事を順番に描画
    while item_idx < len(articles):
        article = articles[item_idx]

        # 記事間の余白
        gap = 32 if item_idx > 0 else 0
        y -= gap

        y_after, fitted = draw_article(
            c, article, y, page_bottom,
            font_title, font_body,
            size_title, size_meta, size_desc,
            lead_title, lead_meta, lead_desc
        )

        if not fitted:
            # ページフッター
            c.setFont(font_body, 9)
            c.drawCentredString(PAGE_W / 2, FOOTER_Y, f"- {page_num} -")
            c.showPage()
            page_num += 1
            y = PAGE_H - MARGIN_T

            # ページ2以降は先頭に余白なし
            y_after, fitted = draw_article(
                c, article, y, page_bottom,
                font_title, font_body,
                size_title, size_meta, size_desc,
                lead_title, lead_meta, lead_desc
            )
            if not fitted:
                # それでも入らない場合（万一）は次ページへ
                c.setFont(font_body, 9)
                c.drawCentredString(PAGE_W / 2, FOOTER_Y, f"- {page_num} -")
                c.showPage()
                page_num += 1
                y = PAGE_H - MARGIN_T
                y_after, _ = draw_article(
                    c, article, y, page_bottom,
                    font_title, font_body,
                    size_title, size_meta, size_desc,
                    lead_title, lead_meta, lead_desc
                )

        y = y_after
        item_idx += 1

    # 最終ページのフッター
    c.setFont(font_body, 9)
    c.drawCentredString(PAGE_W / 2, FOOTER_Y, f"- {page_num} -")
    c.save()
    print(f"PDF generated: {output_path}  ({page_num} pages, {len(articles)} articles)")


if __name__ == "__main__":
    import os
    out = os.path.join(os.path.dirname(__file__), "noteidx.pdf")
    build_pdf(out)
