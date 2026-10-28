import AppRouters from "./router/Approuters";
import CallIncomingListener from "./page/messages/CallIncomingListener";
import { NotificationCenterProvider } from "./page/home/NotificationCenter";
import FloatingChatProvider from "./page/home/FloatingChatProvider";

export default function App(){
  return(
    <NotificationCenterProvider>
      <FloatingChatProvider>
        <AppRouters />
        <CallIncomingListener />
      </FloatingChatProvider>
    </NotificationCenterProvider>
  )
}
