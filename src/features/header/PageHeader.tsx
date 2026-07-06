import { GITHUB_PROFILE_URL } from '../../constants/links';
import ProfileAvatar from '../avatar/ProfileAvatar';
import ThinkingIndicator from '../thinking/ThinkingIndicator';
import './PageHeader.css';

const PageHeader = () => (
    <header className="page-header">
        <div className="page-header__brand">
            <h1 className="page-header__title">TheSlopBot</h1>
            <ThinkingIndicator />
        </div>
        <div className="page-header__actions">
            <h2 className="page-header__subtitle">
                <a
                    className="page-header__link"
                    href={GITHUB_PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    github.com/TheSlopBot
                </a>
            </h2>
            <ProfileAvatar />
        </div>
    </header>
);

export default PageHeader;
