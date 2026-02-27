import useUser from "@/lib/users/useUser";
import useOrganization from "@/lib/organizations/useOrganization";
import { Crisp } from "crisp-sdk-web";
import { useEffect } from "react";

const crispWebsiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

export const CrispChat = () => {
  const { user, isLoading: isUserLoading } = useUser();
  const { organization, isLoading: isOrgLoading } = useOrganization();

  useEffect(() => {
    if (!crispWebsiteId) {
      return;
    }
    Crisp.configure(crispWebsiteId);
  }, []);

  useEffect(() => {
    if (!user || isUserLoading || !crispWebsiteId) {
      return;
    }
    Crisp.user.setEmail(user.email);
    Crisp.user.setNickname(user.name || user.email.split("@")[0]);

    const sessionData: Record<string, unknown> = { ...user };

    if (organization && !isOrgLoading) {
      sessionData.organization_id = organization.id;
      sessionData.organization_name = organization.name;
      if (organization.plan) {
        sessionData.plan = organization.plan.name;
      }
    }

    Crisp.session.setData(sessionData);
  }, [user, isUserLoading, organization, isOrgLoading]);

  return null;
};
