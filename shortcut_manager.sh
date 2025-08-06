#!/bin/bash

# --- 設定 ---
# ショートカットを保存するディレクトリ
SHORTCUTS_DIR="$HOME/.shortcuts"
# スクリプトの表示順を保存するファイル
ORDER_FILE="$SHORTCUTS_DIR/.order"
# 一時的な出力用ファイル
TEMP_OUTPUT="/tmp/shortcut_menu.output"

# --- 初期設定 ---
# ショートカットディレクトリが存在しない場合は作成
mkdir -p "$SHORTCUTS_DIR"
# 表示順ファイルが存在しない場合は作成
touch "$ORDER_FILE"

# --- 関数定義 ---

# 実際のファイルと順序ファイルを同期させる関数
sync_order_file() {
    local ordered_scripts=()
    local actual_scripts=()
    local final_order=()
    local script_found

    # 順序ファイルからスクリプトリストを読み込む
    if [[ -f "$ORDER_FILE" ]]; then
        mapfile -t ordered_scripts < <(grep -v '^$' "$ORDER_FILE")
    fi

    # 実際のディレクトリから実行可能なshファイルリストを取得
    mapfile -t actual_scripts < <(find "$SHORTCUTS_DIR" -maxdepth 1 -type f -name "*.sh" -executable -printf "%f\n")

    # 順序ファイルに記載されているが存在しないファイルを削除
    for script in "${ordered_scripts[@]}"; do
        script_found=false
        for actual_script in "${actual_scripts[@]}"; do
            if [[ "$script" == "$actual_script" ]]; then
                script_found=true
                break
            fi
        done
        if [[ "$script_found" == true ]]; then
            final_order+=("$script")
        fi
    done

    # 実際には存在するが順序ファイルにないファイルを追加
    for actual_script in "${actual_scripts[@]}"; do
        script_found=false
        for ordered_script in "${final_order[@]}"; do
            if [[ "$actual_script" == "$ordered_script" ]]; then
                script_found=true
                break
            fi
        done
        if [[ "$script_found" == false ]]; then
            final_order+=("$actual_script")
        fi
    done

    # 新しい順序をファイルに書き込む
    printf "%s\n" "${final_order[@]}" > "$ORDER_FILE"
}

# 起動モードのメニューを表示する関数
show_launch_menu() {
    sync_order_file # 起動前に必ず同期

    local scripts=()
    mapfile -t scripts < <(grep -v '^$' "$ORDER_FILE")

    if [[ ${#scripts[@]} -eq 0 ]]; then
        dialog --title "ショートカットランチャー" --msgbox "利用可能なショートカットはありません。\n[編集]メニューから追加してください。" 8 60
        return 1 # 編集モードへ
    fi

    local menu_options=()
    for i in "${!scripts[@]}"; do
        menu_options+=("$((i+1))" "${scripts[i]}")
    done

    dialog --clear --title "ショートカットランチャー" \
        --extra-button --extra-label "編集" \
        --cancel-label "終了" \
        --menu "実行したいショートカットを選択してください (↑↓キーで選択、Enterで実行)" 20 70 15 \
        "${menu_options[@]}" 2> "$TEMP_OUTPUT"

    local choice_status=$?
    local choice=$(<"$TEMP_OUTPUT")

    case $choice_status in
        0) # 実行
            local selected_script="${scripts[$((choice-1))]}"
            if [[ -n "$selected_script" ]]; then
                clear
                echo "▶ \"$selected_script\" を実行します..."
                bash "$SHORTCUTS_DIR/$selected_script"
                echo -e "\n--- 実行終了 ---"
                read -n 1 -s -r -p "何かキーを押してメニューに戻ります..."
            else
                dialog --title "エラー" --msgbox "無効な選択です。" 5 30
            fi
            ;;
        1) # 終了
            return 255
            ;;
        3) # 編集
            return 1
            ;;
    esac
    return 0
}

# 編集モードのメニューを表示する関数
show_edit_menu() {
    local scripts=()
    mapfile -t scripts < <(grep -v '^$' "$ORDER_FILE")
    local deleted_scripts=()

    while true; do
        local menu_options=()
        for i in "${!scripts[@]}"; do
            menu_options+=("$((i+1))" "${scripts[i]}")
        done

        dialog --clear --title "編集モード" \
            --ok-label "選択" \
            --cancel-label "キャンセル" \
            --help-button --help-label "保存" \
            --extra-button --extra-label "追加(+)" \
            --menu "操作したい項目を選択してください" 20 70 15 \
            "${menu_options[@]}" 2> "$TEMP_OUTPUT"

        local choice_status=$?
        local choice_index=$(<"$TEMP_OUTPUT")
        choice_index=$((choice_index-1))

        case $choice_status in
            0) # 選択 (操作メニューへ)
                if [[ -z "${scripts[choice_index]}" ]]; then
                    continue
                fi

                dialog --title "操作選択: ${scripts[choice_index]}" \
                    --cancel-label "戻る" \
                    --menu "どの操作を行いますか？" 15 50 4 \
                    1 "上へ移動 (↑)" \
                    2 "下へ移動 (↓)" \
                    3 "削除 (-)" 2> "$TEMP_OUTPUT"
                
                local action_choice=$(<"$TEMP_OUTPUT")
                case $action_choice in
                    1) # 上へ
                        if [[ $choice_index -gt 0 ]]; then
                            local temp="${scripts[choice_index]}"
                            scripts[choice_index]="${scripts[choice_index-1]}"
                            scripts[choice_index-1]="$temp"
                        fi
                        ;;
                    2) # 下へ
                        if [[ $choice_index -lt $((${#scripts[@]}-1)) ]]; then
                             local temp="${scripts[choice_index]}"
                             scripts[choice_index]="${scripts[choice_index+1]}"
                             scripts[choice_index+1]="$temp"
                        fi
                        ;;
                    3) # 削除
                        deleted_scripts+=("${scripts[choice_index]}")
                        # 配列から要素を削除
                        scripts=("${scripts[@]:0:choice_index}" "${scripts[@]:choice_index+1}")
                        ;;
                esac
                ;;
            1) # キャンセル (変更を破棄して戻る)
                dialog --title "確認" --yesno "編集内容を破棄してランチャーに戻りますか？" 6 50
                if [[ $? -eq 0 ]]; then
                    break
                fi
                ;;
            2) # 保存
                # 順序をファイルに書き込む
                printf "%s\n" "${scripts[@]}" > "$ORDER_FILE"

                # 削除対象のファイルを実際に削除
                for script_to_delete in "${deleted_scripts[@]}"; do
                    rm -f "$SHORTCUTS_DIR/$script_to_delete"
                done

                dialog --title "成功" --infobox "変更を保存しました。" 5 30
                sleep 1
                break
                ;;
            3) # 追加(+)
                local path
                path=$(dialog --title "ファイル選択" --fselect "$HOME/" 14 70 2>&1 1>&3)
                if [[ $? -ne 0 ]] || [[ ! -f "$path" ]]; then
                    dialog --title "エラー" --msgbox "ファイルが選択されませんでした。" 5 40
                    continue
                fi

                local default_name
                default_name=$(basename "$path")
                
                local new_name
                new_name=$(dialog --title "ファイル名入力" --inputbox "ショートカットファイル名を入力してください（.shを含む）" 10 60 "$default_name" 2>&1 1>&3)

                if [[ $? -eq 0 ]] && [[ -n "$new_name" ]]; then
                    # ファイルをコピーして実行権限を付与
                    cp "$path" "$SHORTCUTS_DIR/$new_name" && chmod +x "$SHORTCUTS_DIR/$new_name"
                    if [[ $? -eq 0 ]]; then
                        # リストに追加
                        scripts+=("$new_name")
                        dialog --title "成功" --infobox "\"$new_name\" を追加しました。" 5 40
                        sleep 1
                    else
                        dialog --title "エラー" --msgbox "ショートカットの作成に失敗しました。" 5 40
                    fi
                fi
                ;;
        esac
    done
}


# --- メインロジック ---
# 3>&1 1>&2 2>&3 はdialogの出力を正しくリダイレクトするためのおまじない
exec 3>&1
while true; do
    show_launch_menu
    status=$?
    
    if [[ $status -eq 255 ]]; then # 終了
        break
    elif [[ $status -eq 1 ]]; then # 編集モードへ
        show_edit_menu
    fi
done

# 終了処理
exec 3>&-
clear
echo "ショートカットマネージャーを終了しました。"
