import { useHomeFeedActions, useHomeLayoutActions } from "../home/actions";
export function useSavedActions() {
    const layout = useHomeLayoutActions();
    const feed = useHomeFeedActions("", true);
    return { layout, feed };
}
