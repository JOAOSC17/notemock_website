/* eslint-disable require-jsdoc */
import React from "react";
import CollectionItem from "./Sidebar/SidebarItem";
import { useSession } from "next-auth/react";
import axios from "axios";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";

const queryClient = new QueryClient();
/** This is a description of the foo function.
 * @param {string} - This is a description of the foo parameter.
 * @return {string} This is a description of what the function returns.
 */
function Sidebar() {
  const { data: session } = useSession();
  if (session) {
    return (
      <section
        id="sidebar"
        className={` overflow-y-auto md:overflow-y-visible`}
      >
        <h4>Collections</h4>
        <ul className="nav_list mb-24">
          <QueryClientProvider client={queryClient}>
            <SidebarCollections />
          </QueryClientProvider>
        </ul>
      </section>
    );
  } else {
    return (
      <section
        id="sidebar"
        className={` overflow-y-auto md:overflow-y-visible`}
      >
        <h4>Collections</h4>
        <ul className="nav_list mb-24"></ul>
      </section>
    );
  }
}

export default Sidebar;

function SidebarCollections() {
  const { data: session } = useSession();

  const { isLoading, error, data } = useQuery("repoData", () =>
    axios
      .post("https://notemock-website.vercel.app/api/user", {
        session: session,
      })
      .then((res) => res.data)
  );

  if (error)
    return (
      <CollectionItem
        groupname="Error"
        icon="x"
        groupcolor="#f83d3d"
        groupid="404"
      ></CollectionItem>
    );
  if (isLoading)
    return (
      <CollectionItem
        className="animate-pulse"
        groupname="Loading"
        icon="message-square-dots"
        groupcolor="#2c2c2c"
        groupid="200"
      ></CollectionItem>
    );
  if (data.user === undefined || data.user === null) {
    return (
      <CollectionItem
        groupname="Error"
        icon="x"
        groupcolor="#f83d3d"
        groupid="404"
      ></CollectionItem>
    );
  } else {
    return data.user.collections.map((collection: any) => (
      <CollectionItem
        key={collection.groupid}
        groupname={collection.groupname}
        icon={collection.groupicon}
        groupcolor={collection.groupcolor}
        groupid={collection.groupid}
      ></CollectionItem>
    ));
  }
}
