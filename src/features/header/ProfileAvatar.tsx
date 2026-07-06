interface ProfileAvatarProps {
    size?: number;
}

const ProfileAvatar = ({ size = 28 }: ProfileAvatarProps) => (
    <img
        className="profile-avatar"
        src="/assets/theslopbot-avatar.png"
        alt="TheSlopBot"
        width={size}
        height={size}
        style={{ width: size, height: size }}
    />
);

export default ProfileAvatar;
