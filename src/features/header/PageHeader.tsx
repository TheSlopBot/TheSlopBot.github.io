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
            <ProfileAvatar />
        </div>
    </header>
);

export default PageHeader;
