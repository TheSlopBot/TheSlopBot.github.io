import type { CSSProperties } from 'react';
import './ProfileAvatar.css';

interface ProfileAvatarProps {
    size?: number;
}

const ProfileAvatar = ({ size = 56 }: ProfileAvatarProps) => (
    <a
        className="profile-avatar-link"
        href="https://github.com/theslopbot"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TheSlopBot on GitHub"
        style={{ '--avatar-size': `${size}px` } as CSSProperties}
    >
        <img
            className="profile-avatar-link__image"
            src="/assets/theslopbot-avatar.png"
            alt=""
        />
    </a>
);

export default ProfileAvatar;
