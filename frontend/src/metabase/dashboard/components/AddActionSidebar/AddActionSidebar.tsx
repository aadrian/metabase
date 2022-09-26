import React, { useState, useEffect } from "react";
import { t } from "ttag";
import { connect } from "react-redux";

import Sidebar from "metabase/dashboard/components/Sidebar";
import Actions from "metabase/entities/actions";
import {
  addActionToDashboard,
  addTextDashCardToDashboard,
} from "metabase/dashboard/actions";
import type { WritebackAction } from "metabase-types/api";

import { Dispatch } from "metabase-types/store";
import ActionOptionItem from "../ClickBehaviorSidebar/ActionOptions/ActionOptionItem";
import {
  Heading,
  SidebarContent,
} from "../ClickBehaviorSidebar/ClickBehaviorSidebar.styled";

export function AddActionSidebar({ dashId }: { dashId: number }) {
  return (
    <Sidebar>
      <ActionOptionsContainer dashId={dashId} />
    </Sidebar>
  );
}

function ActionOptionsContainer({ dashId }: { dashId: number }) {
  return (
    <SidebarContent>
      <Heading className="text-medium">{t`Pick an action`}</Heading>
      <Actions.ListLoader loadingAndErrorWrapper={false}>
        {({ actions = [] }: { actions: WritebackAction[] }) => (
          <ConnectedActionOptions actions={actions} dashId={dashId} />
        )}
      </Actions.ListLoader>
    </SidebarContent>
  );
}

const ActionOptions = ({
  actions,
  dashId,
  dispatch,
}: {
  actions: WritebackAction[];
  dashId: number;
  dispatch: Dispatch;
}) => (
  <>
    {actions
      .sort((a, b) => b.id - a.id)
      .map(action => (
        <ActionOptionItem
          key={action.id}
          name={action.name}
          description={action.description}
          isSelected={false}
          onClick={() => dispatch(addActionToDashboard({ dashId, action }))}
        />
      ))}
  </>
);

const ConnectedActionOptions = connect()(ActionOptions);
