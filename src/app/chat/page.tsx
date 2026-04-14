import ChatsView from "@/components/views/ChatsView";

type ChatPageSearchParams = {
  [key: string]: string | string[] | undefined;
};

type ChatPageProps = {
  searchParams: Promise<ChatPageSearchParams>;
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const params = await searchParams;
  const userId = getSingleValue(params.userId);
  const name = getSingleValue(params.name);
  const itemId = getSingleValue(params.itemId);
  const backTo = getSingleValue(params.backTo);
  const originTab = getSingleValue(params.from);
  const itemName = getSingleValue(params.itemName);

  return (
    <div className="h-screen w-full bg-[#f8faff] overflow-hidden">
      <ChatsView
        openUserId={userId}
        openUserName={name}
        openOwnerName={name}
        openItemId={itemId}
        openItemName={itemName}
        backTo={backTo}
        originTab={originTab}
        standalone
      />
    </div>
  );
}
