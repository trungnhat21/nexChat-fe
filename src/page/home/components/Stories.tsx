import { Avatar, DesignIcon, DesignImage } from "./DesignAsset";
import { stories } from "../config";
import { useHome } from "../actions";

export default function Stories() {
    const { openPanel } = useHome();
    return <section className="home-stories" aria-label="Tin của bạn bè">
        <button className="home-story home-story-create" onClick={() => openPanel("Tạo tin")}>
            <DesignImage id="3352:584" />
            <span className="home-story-add"><DesignIcon id="3352:588" /></span>
            <strong>Tạo tin</strong>
        </button>
        {stories.map(story => <button key={story.name} className="home-story" onClick={() => openPanel(`Tin của ${story.name}`)}>
            <DesignImage id={story.image} />
            <span className="home-story-gradient" />
            <Avatar id={story.avatar} size={28} />
            <span className="home-story-name">{story.name}</span>
        </button>)}
    </section>;
}
