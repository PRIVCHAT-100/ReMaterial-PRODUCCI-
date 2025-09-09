
import React, { useEffect } from "react";
import Account from "./Account";
import { useFeatureFlags } from "@/contexts/FeatureFlagsProvider";
import { hideChangeEmailIfFlagDisabled } from "@/utils/domFlags";

export default function AccountFlagged() {
  const { enabled } = useFeatureFlags();

  useEffect(() => {
    hideChangeEmailIfFlagDisabled(enabled, { observe: true });
  }, [enabled]);

  return <Account />;
}
