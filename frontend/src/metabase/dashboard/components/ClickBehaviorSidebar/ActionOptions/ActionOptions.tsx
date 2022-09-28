import React, { useCallback, useState } from "react";
import { t } from "ttag";
import { connect } from "react-redux";

import Actions from "metabase/entities/actions";

import { updateButtonActionMapping } from "metabase/dashboard/actions";

import ActionPicker from "metabase/containers/ActionPicker";

import type {
  ActionDashboardCard,
  ActionParametersMapping,
  WritebackAction,
  ModelAction,
} from "metabase-types/api";
import type { State } from "metabase-types/store";
import type { UiParameter } from "metabase/parameters/types";

import { Heading, SidebarContent } from "../ClickBehaviorSidebar.styled";

import ActionClickMappings from "./ActionClickMappings";
import {
  ClickMappingsContainer,
  ActionPickerWrapper,
} from "./ActionOptions.styled";

interface ActionOptionsOwnProps {
  dashcard: ActionDashboardCard;
  parameters: UiParameter[];
}

interface ActionOptionsDispatchProps {
  onUpdateButtonActionMapping: (
    dashCardId: number,
    settings: {
      action_id?: number | null;
      parameter_mappings?: ActionParametersMapping[] | null;
    },
  ) => void;
}

type ActionOptionsProps = ActionOptionsOwnProps & ActionOptionsDispatchProps;

const mapDispatchToProps = {
  onUpdateButtonActionMapping: updateButtonActionMapping,
};

function ActionOptions({
  actions,
  dashcard,
  parameters,
  onUpdateButtonActionMapping,
}: ActionOptionsProps & { actions: WritebackAction[] }) {
  const selectedAction = dashcard.action;

  const handleActionSelected = useCallback(
    (action: ModelAction) => {
      onUpdateButtonActionMapping(dashcard.id, {
        card_id: action.card_id,
        action,
        visualization_settings: {
          ...dashcard.visualization_settings,
          action_slug: action.slug, // :-( so hacky
        },

        // Clean mappings from previous action
        // as they're most likely going to be irrelevant
        parameter_mappings: null,
      });
    },
    [dashcard, onUpdateButtonActionMapping],
  );

  const handleParameterMappingChange = useCallback(
    (parameter_mappings: ActionParametersMapping[] | null) => {
      onUpdateButtonActionMapping(dashcard.id, {
        parameter_mappings,
      });
    },
    [dashcard, onUpdateButtonActionMapping],
  );

  return (
    <div style={{ maxHeight: "calc(100vh - 25rem)", overflowY: "auto" }}>
      <ActionPickerWrapper>
        <ActionPicker value={selectedAction} onChange={handleActionSelected} />
      </ActionPickerWrapper>

      {!!selectedAction && (
        <ClickMappingsContainer>
          <ActionClickMappings
            action={selectedAction}
            dashcard={dashcard}
            parameters={parameters}
            onChange={handleParameterMappingChange}
          />
        </ClickMappingsContainer>
      )}
    </div>
  );
}

function ActionOptionsContainer(props: ActionOptionsProps) {
  return (
    <SidebarContent>
      <Heading className="text-medium">{t`Pick an action`}</Heading>
      <Actions.ListLoader loadingAndErrorWrapper={false}>
        {({ actions = [] }: { actions: WritebackAction[] }) => (
          <ActionOptions {...props} actions={actions} />
        )}
      </Actions.ListLoader>
    </SidebarContent>
  );
}

export default connect<
  unknown,
  ActionOptionsDispatchProps,
  ActionOptionsOwnProps,
  State
>(
  null,
  mapDispatchToProps,
)(ActionOptionsContainer);
