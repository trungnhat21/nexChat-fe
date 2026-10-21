import { pollOptions } from "../config";
import { useProfilePollActions } from "../actions";
import { ProfileIcon } from "./ProfileAsset";
import type { ProfilePollProps } from "../../../component/type/profile";

export default function ProfilePoll({ onNotice, onDiscuss }: ProfilePollProps) {
    const { selected, selectOption, percentage } = useProfilePollActions(onNotice);
    return <div className="profile-poll">
        <div className="profile-poll-options" role="group" aria-label="Bình chọn công cụ AI">
            {pollOptions.map((option, index) => <button key={option.label} className={`profile-poll-option ${selected === index ? "is-selected" : ""} profile-poll-option-${index}`} aria-pressed={selected === index} onClick={() => selectOption(index)}>
                <span className={`profile-poll-progress profile-progress-${percentage(index)}`} />
                <span className="profile-poll-label"><ProfileIcon id={selected === index ? "3360:719" : index === 2 ? "3360:739" : "3360:729"} />{option.label}</span><strong>{percentage(index)}%</strong>
            </button>)}
        </div>
        <div className="profile-poll-meta"><span>528 lượt bình chọn • Còn 2 ngày</span><button onClick={onDiscuss}>Xem tất cả thảo luận</button></div>
    </div>;
}
