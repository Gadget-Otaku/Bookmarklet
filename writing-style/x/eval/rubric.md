# Independent judge rubric v1.0

各候補を全13軸、0–5で独立採点。0=破綻、1=大きな問題、2=複数の弱点、3=実用可能だが違和感、4=小さな改善余地、5=明示条件と資料に十分一致。作者推定確率やAI検出scoreではない。

| Axis | 判定対象 |
| --- | --- |
| style_similarity | profileとreferenceの本人固有の選択・語尾 |
| thought_flow | 用途、制約、反論、更新条件の順序 |
| vocabulary | 話題・感情に対する口語と専門語 |
| rhythm | 句読点、間、短長、改行 |
| mode | 指定genre、丁寧さ、瞬間反応 |
| emotion | 入力の喜怒・強さ保持 |
| sarcasm | 入力にある皮肉の機能。皮肉なしでは混入の不存在 |
| x_naturalness | Xに載せる文章としての読みやすさ |
| ai_pattern_avoidance | 不要な見出し、教訓、網羅、公平性の不存在 |
| conciseness | 重要内容を落とさず圧縮 |
| intent | 結論、対象、留保、感情、依頼を維持 |
| fact_discipline | 入力外の経験・数値・断定・検索済み偽装の不存在 |
| over_imitation_avoidance | 口癖、罵倒、疑問、自己反論の機械挿入の不存在 |

原文一致率を点数にしない。referenceは唯一の正解文ではない。事実、経験、感情の捏造がある候補はintent/factを高得点にしない。過去の企業評価・本人所有物を持ち込まない。3候補の構造差も確認し、単なる同義語置換はthree_outputs_too_similar。

failure labelはtoo_ai_like, too_verbose, too_aggressive, too_many_slang_markers, too_many_maa, insufficient_sarcasm, fake_sarcasm, excessive_balance, lost_emotion, invented_facts, over_correction, wrong_mode, formal_mode_too_casual, short_reaction_too_verbose, three_outputs_too_similar, intent_loss, certainty_shift, awkward_rhythmから選ぶ。欠点がなければ空配列。指摘には候補番号と短い具体的根拠を付ける。

合否: 機械条件は全件PASSを目標。品質目安は全軸平均4.0以上、intent/fact平均4.5以上。LLM judgeのみの品質判定は暫定。最良versionの選択は機械PASS件数、intent/fact、全軸平均の順。developmentから選び、finalを選択に使わない。
