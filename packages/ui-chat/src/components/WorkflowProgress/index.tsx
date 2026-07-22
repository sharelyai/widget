import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Wrapper } from "./styles";

import { useWorkflowProgressStore } from "../../stores/workflowProgressStore";
import {
  useWorkflows,
  constants,
  useSharelyContext,
  classNames,
} from "@sharelyai/widget-services";
import { ArrowDown, Check } from "@sharelyai/widget-ui-shared";

const EMPTY_DATA: any[] = [];
const NOOP = () => {};

export interface WorkflowProgressProps {
  workspaceId?: string;
  messageId: string;
  groupId?: string;
  messageFrom?: string;
  type: "USER" | "MESSAGE";
  showCollapse?: boolean;
  data?: any[];
  setShowCollapse?: (show: boolean) => void;
}

export const WorkflowProgress = (props: WorkflowProgressProps) => {
  const {
    workspaceId,
    messageId,
    messageFrom = "",
    type,
    showCollapse = false,
    data = EMPTY_DATA,
    groupId,
    setShowCollapse = NOOP,
  } = props;

  const { workflowId, setWorkflowId } = useWorkflowProgressStore();
  const queryClient = useQueryClient();
  const { workflows } = useWorkflows({ workspaceId: workspaceId || "" });
  const { apiClient } = useSharelyContext();
  const lastSyncedDataRef = useRef<any>(null);

  const workflowProgressData = useQuery({
    queryKey: [
      "workflowProgress",
      workspaceId,
      workflowId,
      messageFrom,
      messageId || groupId,
    ],
    queryFn: async () => {
      if (!workspaceId || !workflowId) return [];

      if (messageId) {
        return apiClient.fetcher(
          `/workspaces/${workspaceId}/workflows/${workflowId}/progress?messageId=${messageId}&messageFrom=${messageFrom}`,
        );
      } else if (groupId) {
        const response = await apiClient.fetcher<any[]>(
          `/workspaces/${workspaceId}/workflows/${workflowId}/progress-by-group?groupId=${groupId}&messageFrom=${messageFrom}`,
        );
        return response?.filter((item) => item?.status === "PENDING") ?? [];
      }
      return [];
    },
    initialData: data,
    enabled:
      Boolean(workspaceId) &&
      Boolean(workflowId) &&
      Boolean(messageFrom) &&
      data?.length === 0,
    refetchInterval: (query: any) => {
      const queryData = query?.state?.data;
      if (queryData?.error) {
        return false;
      }
      if (
        Array.isArray(queryData) &&
        queryData.length > 0 &&
        queryData.every((item: any) => item?.status !== "PENDING")
      ) {
        return false;
      }
      return 500;
    },
    retry: 3,
    retryDelay: 500,
  });

  useEffect(() => {
    if (workflows && workflows.length > 0) {
      const findWorkflow = workflows.find(
        (workflow: any) =>
          workflow.direction ===
          constants.SPACE_CONVERSATION_RETRIVAL_DATA_DEBUG_CONTENT_FROM_SPACE,
      );
      setWorkflowId(findWorkflow?.id || "");
    }
  }, [workflows]);

  useEffect(() => {
    if (data?.length === 0 && !showCollapse) {
      setShowCollapse(true);
    }
  }, [data, showCollapse, setShowCollapse]);

  useEffect(() => {
    const progressData = workflowProgressData?.data;
    if (
      !progressData ||
      !Array.isArray(progressData) ||
      progressData.length === 0
    )
      return;
    // Skip if we already synced this exact data reference
    if (progressData === lastSyncedDataRef.current) return;
    lastSyncedDataRef.current = progressData;

    const queryKeys: Record<string, string> = {
      [constants.WORKFLOW_MESSAGE_FROM_TYPE_SPACE]: "spaces-messages",
    };

    const queryKey = queryKeys[messageFrom];

    if (!queryKey) return;

    const query = queryClient
      .getQueryCache()
      .findAll()
      .find((q) => q.queryKey[0] === queryKey);

    if (!query) return;

    const messagesValue =
      (query?.state?.data as any)?.["messages"] || query?.state?.data || [];

    let messageIdIndex: number | undefined = undefined;
    let messageUserIndex: number | undefined = undefined;
    let messageUserData: any = undefined;

    if (Array.isArray(messagesValue)) {
      messageIdIndex = messagesValue.findIndex(
        (item: any) => item.id === messageId,
      );
      if (messageIdIndex !== -1) {
        messageUserIndex = messageIdIndex + 1;
        messageUserData = messagesValue[messageUserIndex];
      }
    }

    if (
      messageUserIndex === undefined ||
      !messageUserData ||
      !messageUserData?.temp
    )
      return;

    queryClient.setQueryData(query.queryKey, (oldData: any) => {
      const hasMessages = Boolean(oldData?.["messages"]);
      const updatedData = [...(oldData?.["messages"] || oldData)];

      if (updatedData?.[messageUserIndex as number]) {
        updatedData[messageUserIndex as number] = {
          ...updatedData[messageUserIndex as number],
          workflowProgresses: progressData,
        };
      }
      return hasMessages ? { messages: updatedData } : updatedData;
    });
  }, [workflowProgressData?.data, messageFrom, messageId, queryClient]);

  const toggleCollapse = () => {
    setShowCollapse(!showCollapse);
  };

  if (!workflowId || !Array.isArray(workflowProgressData?.data)) return null;

  if (type === "USER") {
    return (
      <Wrapper>
        <div className="right">
          <button
            className={classNames("process-section", {
              open: showCollapse,
            })}
            onClick={toggleCollapse}
          >
            Progress
            <ArrowDown />
          </button>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {showCollapse && (
        <div className={"process-progress"}>
          <div className="process-progress-body">
            {Array.isArray(workflowProgressData?.data) &&
              workflowProgressData?.data?.map((item: any, index: number) => {
                const isLoading = item?.status === "PENDING";
                const isCompleted = item?.status === "COMPLETED";

                return item?.logs?.map((log: any, logIndex: number) => {
                  return (
                    <div className="step" key={`step-${index}-${logIndex}`}>
                      <span className="icon">
                        {isLoading && (
                          <div className="sharelyai-webcontroller-loading-icon">
                            <div className="sharelyai-webcontroller-circular-loader"></div>
                          </div>
                        )}
                        {isCompleted && <Check />}
                      </span>
                      <div className="content">
                        <span className="title">
                          {log?.status?.slice(0, 1).toUpperCase() +
                            log?.status?.slice(1).toLowerCase()}
                        </span>
                        <span className="description">
                          {log?.statusMessage}
                        </span>
                      </div>
                    </div>
                  );
                });
              })}
          </div>
        </div>
      )}
    </Wrapper>
  );
};
