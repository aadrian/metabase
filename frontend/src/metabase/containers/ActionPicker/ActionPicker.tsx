import React, { useEffect, useState } from "react";
import { t } from "ttag";
import { ModelActionsApi } from "metabase/services";
import Button from "metabase/core/components/Button";

import type { ModelAction, WritebackAction } from "metabase-types/api";

import EmptyState from "metabase/components/EmptyState";
import ModelPicker from "../ModelPicker";
import ActionOptionItem from "./ActionOptionItem";

export default function ActionPicker({
  value,
  onChange,
}: {
  value: ModelAction | WritebackAction | undefined;
  onChange: (value: ModelAction) => void;
}) {
  const [modelId, setModelId] = useState<number | undefined>(value?.card_id);

  return (
    <>
      {!modelId ? (
        <ModelPicker value={modelId} onChange={setModelId} />
      ) : (
        <>
          <Button
            icon="arrow_left"
            borderless
            onClick={() => setModelId(undefined)}
          >
            {t`Select Model`}
          </Button>
          <ModelActionPicker
            modelId={modelId}
            value={value}
            onChange={onChange}
          />
        </>
      )}
    </>
  );
}

function ModelActionPicker({
  modelId,
  value,
  onChange,
}: {
  modelId: number;
  value: ModelAction | WritebackAction | undefined;
  onChange: (newValue: ModelAction) => void;
}) {
  const [modelActions, setModelActions] = useState<ModelAction[]>([]);

  useEffect(() => {
    ModelActionsApi.getModelActions({ id: modelId }).then(setModelActions);
  }, [modelId]);

  console.log("model actions", modelActions);

  return (
    <ul>
      {!modelActions?.length ? (
        <EmptyState
          message={t`There are no actions for this model`}
          action={t`Create new action`}
          link={"/action/create"}
        />
      ) : (
        modelActions?.map(action => (
          <ActionOptionItem
            name={action.name ?? action.slug}
            isSelected={action.id === value?.id}
            key={action.slug}
            onClick={() => onChange(action)}
          />
        ))
      )}
    </ul>
  );
}
