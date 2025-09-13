import { Autocomplete, AutocompleteOption, Chip } from "@mui/joy";
import { Button, Checkbox } from "@usememos/mui";
import { uniqBy } from "lodash-es";
import { LinkIcon } from "lucide-react";
import React, { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { memoServiceClient } from "@/grpcweb";
import { DEFAULT_LIST_MEMOS_PAGE_SIZE } from "@/helpers/consts";
import useCurrentUser from "@/hooks/useCurrentUser";
import { extractMemoIdFromName } from "@/store/v1";
import { MemoRelation, MemoRelation_Memo, MemoRelation_Type } from "@/types/proto/api/v1/memo_relation_service";
import { Memo } from "@/types/proto/api/v1/memo_service";
import { useTranslate } from "@/utils/i18n";
import { EditorRefActions } from "../Editor";
import { MemoEditorContext } from "../types";
import { SearchIcon } from "lucide-react";
import { Settings2Icon } from "lucide-react";
// import { useMemoStore } from "@/store/v1";

interface Props {
  editorRef: React.RefObject<EditorRefActions>;
}

const MoveMemoPopover = (props: Props) => {
  const { editorRef } = props;
  const t = useTranslate();
  const context = useContext(MemoEditorContext);
  const user = useCurrentUser();
  const [parentUIDText, setParentUIDText] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [fetchedMemos, setFetchedMemos] = useState<Memo[]>([]);
  const [selectedMemos, setSelectedMemos] = useState<Memo[]>([]);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  // const memoStore = useMemoStore();

  const filteredMemos = fetchedMemos.filter(
    (memo) =>
      !selectedMemos.includes(memo) &&
      memo.name !== context.memoName &&
      !context.relationList.some((relation) => relation.relatedMemo?.name === memo.name),
  );


  const addMemoRelations = async () => {
    let list = context.relationList.filter(e => e.type != MemoRelation_Type.COMMENT);
    context.setRelationList(
      uniqBy(
        [
          ...[{
            memo: MemoRelation_Memo.fromPartial({ name: context.memoName }),
            relatedMemo: MemoRelation_Memo.fromPartial({ name: `memos/${parentUIDText}` }),
            type: MemoRelation_Type.COMMENT,
          }],
          ...list,
        ].filter((relation) => relation.relatedMemo !== context.memoName),
        "relatedMemo",
      ),
    );
    setSelectedMemos([]);
    setPopoverOpen(false);
  };

  const onTextChange = (event: React.FormEvent<HTMLInputElement>) => {
    setParentUIDText(event.currentTarget.value);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger className="w-9 relative">
        <Button className="flex items-center justify-center" size="sm" variant="plain" asChild>
          <Settings2Icon className="w-5 h-5 mx-auto p-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center">
        <div className="w-[16rem] flex flex-col justify-start items-start">

          <div className="relative w-full h-auto flex flex-row justify-start items-center">
            <SearchIcon className="absolute left-3 w-4 h-auto opacity-40" />
            <input
              className="w-full text-gray-500 dark:text-gray-400 bg-zinc-50 dark:bg-zinc-900 border dark:border-zinc-800 text-sm leading-7 rounded-lg p-1 pl-8 outline-none"
              placeholder={"input memo uid"}
              value={parentUIDText}
              onChange={onTextChange}
            // onKeyDown={onKeyDown}
            />
          </div>

          <div className="mt-2 w-full flex flex-row justify-end items-center gap-2">
            <Button size="sm" color="primary" onClick={addMemoRelations} disabled={!parentUIDText || parentUIDText.length === 0}>
              {t("common.confirm")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MoveMemoPopover;
