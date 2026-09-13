# Corpus manifest

- Original filename: x_niwakasumaho_posts_detailed_2026-09-11_10-17-22.txt
- Local original path: recorded in ignored x/.local/corpus/source-location.json. Original preserved; copy byte equality verified.
- SHA-256: 0f57b33bb6a12a9a608087dbf4750b82fa32c4fdd9ab6b6597b813fb4fcdd919
- Bytes: 582556; lines: 12585
- Export declared: 1824; parsed: 1824; record headers: 1824
- Duplicate IDs: 0; duplicate URLs: 0
- Missing dates/URLs/invalid IDs: 0/0/0
- Empty bodies: 0; malformed: 0
- Explicit export no-body/media placeholder: 3. These are nonempty TXT strings, not natural author prose.
- Export wall-time range: 2024-12-28T18:29:47 – 2026-09-09T23:29:15. Timezone was not included in the TXT and is not inferred.
- Deterministic split: int(SHA256(ASCII(post_id)).hexdigest(),16) % 10; 0..7=train,8=development,9=final; no seed
- Train: 1486; development: 176; final locked: 162
- Parser: 1.0.0; initial split fixed before substantive body analysis.
- Automated no-natural-text / media-or-tags-only count: 10 ({'train': 7, 'development': 2, 'final': 1}). This is not proof of attached media: the export has no attachment field.
- Train semantic media-only/context-only labels: 7. This uses a broader semantic judgment and is not the same denominator/definition as automated detection.
- Exact text hash types shared with train: development=1, final=2. These are structural overlap diagnostics, not released holdout text. Short stock reactions can coincide across IDs; ID split is not a topic/thread split.

Raw corpus is local-only because future platforms can include private messages. Raw texts, post-ID mapping, reconstructed briefs, judge references, and events stay in .local. Tracked files contain source hash, aggregate statistics, sanitized synthetic cases and index/category/mode labels only.

The final set is not used for style tuning. Development evaluation selects 24 records by ascending SHA-256("eval-v1:" + post_id), before reading selected content. The final evaluation uses all 162 assigned records; insufficient context is reported separately, never silently replaced.
