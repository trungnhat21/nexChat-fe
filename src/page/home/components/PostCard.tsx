import { Avatar, DesignIcon, DesignImage } from "./DesignAsset";
import type { CommentItemProps, PostCardProps } from "../../../component/type/home";
import { pollOptions, postHashtags } from "../config";
import { useCommentActions, usePollActions, usePostActions } from "../actions";


function CommentItem({ comment, onReply }: CommentItemProps) {
    const { liked, toggleLike } = useCommentActions();
    return <div className="home-comment">
        <Avatar id={comment.avatar} size={32} />
        <div className="home-comment-body"><div className="home-comment-bubble"><div><strong>{comment.author}</strong><time>{comment.time}</time></div><p>{comment.text}</p></div>
            <div className="home-comment-actions"><button aria-label={`Thích bình luận của ${comment.author}`} aria-pressed={liked} onClick={toggleLike}><DesignIcon id={comment.id === "phuong-thao" ? "3352:780" : "3352:761"} />{comment.likes + Number(liked)}</button><button onClick={onReply}>Trả lời</button></div>
        </div>
    </div>;
}

function Poll() {
    const { selected, selectOption, getPercentage } = usePollActions();
    return <div className="home-poll" role="group" aria-label="Bình chọn công cụ AI">
        {pollOptions.map((label, index) => {
            const percent = getPercentage(index);
            return <button className={`home-poll-option ${selected === index ? "is-selected" : ""}`} aria-pressed={selected === index} key={label} onClick={() => selectOption(index)}>
                <span className={`home-poll-bar home-poll-progress-${percent}`} />
                <span className="home-poll-label">{selected === index ? <DesignIcon id="3352:819" /> : <span className="home-poll-radio" />}{label}</span><strong>{percent}%</strong>
            </button>;
        })}
        <div className="home-poll-meta"><span>Tổng cộng 1,248 phiếu bầu</span><span>Còn lại 2 ngày bình chọn</span></div>
    </div>;
}

export default function PostCard({ post }: PostCardProps) {
    const { isImage, liked, saved, commentsOpen, comments, draft, setDraft, inputRef, openPanel, setSearch, likeCount, commentCount, reply, share, toggleLike, toggleSave, submitComment, insertEmoji } = usePostActions(post);
    return <article className={`home-card home-post home-post-${post.kind}`} id={post.id}>
        <header className="home-post-header">
            <Avatar id={post.avatar} size={post.kind === "text" ? 40 : 44} online />
            <div className="home-post-author"><div><strong>{post.author}</strong>{post.kind !== "text" && <DesignIcon id={isImage ? "3352:663" : "3352:800"} />}<time>• {post.time}</time></div><small>{post.role} <DesignIcon id={isImage ? "3352:670" : "3352:807"} /></small></div>
            <button className="home-icon-button" aria-label={`Tùy chọn bài viết của ${post.author}`} onClick={() => openPanel("Tùy chọn bài viết")}><DesignIcon id={isImage ? "3352:673" : "3352:810"} /></button>
        </header>
        <div className="home-post-content"><p>{post.content}</p>
            {isImage && <div className="home-hashtags">{postHashtags.map(tag => <button key={tag} onClick={() => setSearch(tag)}>{tag}</button>)}</div>}
        </div>
        {isImage && <DesignImage id="3352:688" className="home-post-photo" alt="Concept ứng dụng Pulse trên điện thoại với hệ thống thiết kế mới" />}
        {post.kind === "poll" && <Poll />}
        {isImage && <div className="home-post-stats"><button onClick={() => openPanel("Người thích bài viết")}><span className="home-reactions"><span><DesignIcon id="3352:694" /></span><span><DesignIcon id="3352:699" /></span></span>{likeCount} người thích</button><span><button onClick={() => reply()}>{commentCount} bình luận</button><button onClick={share}>15 lượt chia sẻ</button></span></div>}
        <div className="home-post-actions">
            <button className={liked ? "is-liked" : ""} aria-pressed={liked} onClick={toggleLike}><DesignIcon id={isImage ? "3352:710" : "3352:850"} />{isImage ? (liked ? "Đã thích" : "Thích") : `${likeCount} Thích`}</button>
            <button onClick={() => reply()} aria-expanded={commentsOpen}><DesignIcon id={isImage ? "3352:715" : "3352:855"} />{isImage ? "Bình luận" : `${commentCount} Ý kiến`}</button>
            <button onClick={share}><DesignIcon id={isImage ? "3352:720" : "3352:860"} />Chia sẻ</button>
            <button className={saved ? "is-saved" : ""} aria-pressed={saved} onClick={toggleSave}><DesignIcon id={isImage ? "3352:725" : "3352:865"} />{saved ? "Đã lưu" : "Lưu"}</button>
        </div>
        {commentsOpen && <section className="home-comments" aria-label="Bình luận">
            <form className="home-comment-form" onSubmit={submitComment}><Avatar id="3352:731" size={32} /><div className="home-comment-input"><input ref={inputRef} value={draft} maxLength={2000} onChange={event => setDraft(event.target.value)} placeholder="Viết bình luận công khai của bạn..." aria-label="Viết bình luận" /><button type="button" aria-label="Chèn cảm xúc" onClick={insertEmoji}><DesignIcon id="3352:738" /></button><button type="button" aria-label="Đính kèm vào bình luận" onClick={() => openPanel("Đính kèm bình luận")}><DesignIcon id="3352:741" /></button><button type="submit" aria-label="Gửi bình luận"><DesignIcon id="3352:744" /></button></div></form>
            {comments.map(comment => <CommentItem key={comment.id} comment={comment} onReply={() => reply(comment.author)} />)}
            {isImage && <button className="home-more-comments" onClick={() => openPanel("Các bình luận khác")}>Xem thêm 46 bình luận khác...</button>}
        </section>}
    </article>;
}
