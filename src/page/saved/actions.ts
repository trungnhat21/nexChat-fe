import { useHomeFeedActions, useHomeLayoutActions } from "../home/actions";
export function useSavedActions() {
    const layout = useHomeLayoutActions();
    const feed = useHomeFeedActions(layout.search, true);
    return { layout, feed };
}
