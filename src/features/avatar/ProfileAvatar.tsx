import { GITHUB_PROFILE_URL } from '../../constants/links';
import './ProfileAvatar.css';

const ProfileAvatar = () => (
    <a
        className="profile-avatar-link"
        href={GITHUB_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TheSlopBot on GitHub"
    >
        <img
            className="profile-avatar-link__image"
            src="/assets/theslopbot-avatar.png"
            alt=""
        />
    </a>
);

export default ProfileAvatar;
