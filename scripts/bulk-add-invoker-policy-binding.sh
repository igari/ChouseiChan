#!/bin/bash

# このスクリプトは、Cloud Functionsでデプロイする関数に対して
# 一括でプリンシパルを設定し、ロールをClound Functionsの起動元に設定するためのスクリプトです
# これによって、Cloud Functionsの関数が公開されだれからのリクエストでも許可することができます

region="asia-northeast1"

project="itsusuru-686b1"

declare -a functions=("responseEvent" "fetchHome" "fetchEvent" "createEvent" "fetchEdit" "updateEvent")

for functionName in "${functions[@]}"
do
  gcloud functions add-invoker-policy-binding $functionName \
    --region=$region \
    --member="allUsers" \
    --project=$project
  echo "$functionName の権限を変更しました"
done