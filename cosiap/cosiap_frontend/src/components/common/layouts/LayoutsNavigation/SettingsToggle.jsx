export default function SettingsToggle( {settingsToggleRef} ) {
    return (
        <div ref={settingsToggleRef} className="ml-2 flex items-center">
            <span className="material-symbols-outlined text-[var(--principal-mf)] select-none">
                settings
            </span>
        </div>
    );
}