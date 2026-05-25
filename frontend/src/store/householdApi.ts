import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GetTokenSilentlyOptions } from "@auth0/auth0-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type User = {
  id: string;
  email: string;
  display_name: string | null;
  household_id: string | null;
};

export type Household = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
};

export type Member = {
  id: string;
  email: string;
  display_name: string | null;
};

export type InviteResponse = {
  id: string;
  token: string;
  invited_email: string;
  household_id: string;
  status: string;
  expires_at: string;
};

// ---------------------------------------------------------------------------
// Auth0 token bridge
// ---------------------------------------------------------------------------

let _getToken: ((opts?: GetTokenSilentlyOptions) => Promise<string>) | null = null;

export function setTokenGetter(
  fn: (opts?: GetTokenSilentlyOptions) => Promise<string>
) {
  _getToken = fn;
}

// ---------------------------------------------------------------------------
// API slice
// ---------------------------------------------------------------------------

export const householdApi = createApi({
  reducerPath: "householdApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    prepareHeaders: async (headers) => {
      if (_getToken) {
        const token = await _getToken();
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Household", "Members"],
  endpoints: (builder) => ({

    authCallback: builder.mutation<User, void>({
      query: () => ({ url: "/auth/callback", method: "POST" }),
    }),

    getMyHousehold: builder.query<Household, void>({
      query: () => "/households/me",
      providesTags: ["Household"],
    }),

    getMembers: builder.query<Member[], void>({
      query: () => "/households/me/members",
      providesTags: ["Members"],
    }),

    createHousehold: builder.mutation<Household, { name: string }>({
      query: (body) => ({ url: "/households", method: "POST", body }),
      invalidatesTags: ["Household", "Members"],
    }),

    inviteMember: builder.mutation<InviteResponse, { email: string }>({
      query: (body) => ({ url: "/households/invite", method: "POST", body }),
    }),

    joinHousehold: builder.mutation<Household, { token: string }>({
      query: (body) => ({ url: "/households/join", method: "POST", body }),
      invalidatesTags: ["Household", "Members"],
    }),

    leaveHousehold: builder.mutation<void, void>({
      query: () => ({ url: "/households/leave", method: "DELETE" }),
      invalidatesTags: ["Household", "Members"],
    }),
  }),
});

export const {
  useAuthCallbackMutation,
  useGetMyHouseholdQuery,
  useGetMembersQuery,
  useCreateHouseholdMutation,
  useInviteMemberMutation,
  useJoinHouseholdMutation,
  useLeaveHouseholdMutation,
} = householdApi;