import ProfileAvatar from './ProfileAvatar';
import ThinkingLine from './ThinkingLine';
import './PageHeader.css';

const PageHeader = () => (
    <header className="page-header">
        <div className="page-header__scrim" aria-hidden />
        <div className="page-header__edge" aria-hidden />
        <div className="page-header__row">
            <ProfileAvatar />
            <h1 className="page-header__title">TheSlopBot</h1>
            <ThinkingLine />
        </div>
    </header>
);

export default PageHeader;
