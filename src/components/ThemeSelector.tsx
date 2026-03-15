import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES, THEME_GROUPS, type Theme } from '../lib/themes';

interface ThemeSelectorProps {
    activeTheme: string;
    onThemeChange: (themeId: string) => void;
}

/** Extract a css property value from an inline style string */
function extractStyle(styleStr: string, prop: string): string | null {
    const regex = new RegExp(`${prop}\\s*:\\s*([^;!]+)`, 'i');
    const match = styleStr.match(regex);
    return match ? match[1].trim() : null;
}

/** Build a mini color swatch from theme styles */
function ThemeSwatch({ styles }: { styles: Record<string, string> }) {
    const bg = extractStyle(styles.container || '', 'background-color') || '#fff';
    const textColor = extractStyle(styles.p || '', 'color') || '#333';
    const h1Color = extractStyle(styles.h1 || '', 'color') || textColor;
    const accentColor = extractStyle(styles.a || styles.blockquote || '', 'color') || h1Color;

    return (
        <div className="flex gap-0.5 h-5 rounded-md overflow-hidden border border-[#00000015] dark:border-[#ffffff15]" style={{ width: '48px' }}>
            <div className="flex-1" style={{ backgroundColor: bg }} />
            <div className="flex-1" style={{ backgroundColor: h1Color }} />
            <div className="flex-1" style={{ backgroundColor: accentColor }} />
            <div className="flex-1" style={{ backgroundColor: textColor }} />
        </div>
    );
}

export default function ThemeSelector({ activeTheme, onThemeChange }: ThemeSelectorProps) {
    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const [showBottomFade, setShowBottomFade] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const selectedThemeName = THEMES.find(t => t.id === activeTheme)?.name;

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        setShowBottomFade(scrollHeight - scrollTop - clientHeight > 20);
    };

    useEffect(() => {
        if (isThemeOpen && scrollRef.current) {
            handleScroll();
        }
    }, [isThemeOpen]);

    // Keep top quick-switch pills fixed for best discoverability.
    const pillThemeIds = ['apple', 'claude', 'wechat', 'sspai'];
    const pillThemes: Theme[] = pillThemeIds
        .map(id => THEMES.find(theme => theme.id === id))
        .filter((theme): theme is Theme => Boolean(theme));
    const isInDropdown = !pillThemes.some(theme => theme.id === activeTheme);

    return (
        <div className="flex items-center flex-wrap gap-2 lg:gap-4 px-4 lg:px-6 py-3 border-r border-transparent md:border-[#00000015] md:dark:border-[#ffffff15] shrink-0">
            <span className="text-[12px] font-semibold text-[#86868b] uppercase tracking-widest hidden xl:block shrink-0">排版风格</span>

            <div className="flex items-center gap-1.5 bg-[#00000008] dark:bg-[#ffffff10] p-1 rounded-full backdrop-blur-md shrink-0">
                {pillThemes.map(theme => (
                    <button
                        key={theme.id}
                        onClick={() => onThemeChange(theme.id)}
                        className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${activeTheme === theme.id
                            ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-sm'
                            : 'text-[#86868b] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]'
                            }`}
                    >
                        {theme.name.split(' ')[0]}
                    </button>
                ))}
            </div>

            <div className="relative shrink-0">
                <button
                    onClick={() => setIsThemeOpen(!isThemeOpen)}
                    className={`apple-export-btn flex items-center gap-2 !px-4 !py-1.5 !text-[13px] transition-all ${isInDropdown ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border-[#00000010] dark:border-[#ffffff10] shadow-sm' : 'border-transparent bg-transparent hover:bg-transparent dark:bg-transparent text-[#86868b] dark:text-[#a1a1a6] shadow-none hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'}`}
                >
                    {isInDropdown ? selectedThemeName : `全部 ${THEMES.length} 款`}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isThemeOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isThemeOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30"
                                onClick={() => setIsThemeOpen(false)}
                            />
                            {/* Grid panel */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                                className="fixed left-4 right-4 sm:absolute sm:left-0 sm:right-auto top-auto sm:top-12 w-auto sm:w-[580px] md:w-[680px] bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-apple-lg border border-[#00000015] dark:border-[#ffffff15] z-50 overflow-hidden"
                                style={{ maxHeight: 'min(70vh, 600px)' }}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                    <span className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">选择排版风格 · {THEMES.length} 款</span>
                                    <button
                                        onClick={() => setIsThemeOpen(false)}
                                        className="p-1 rounded-full hover:bg-[#00000008] dark:hover:bg-[#ffffff10] transition-colors"
                                    >
                                        <X size={16} className="text-[#86868b]" />
                                    </button>
                                </div>

                                {/* Scrollable grid */}
                                <div
                                    ref={scrollRef}
                                    onScroll={handleScroll}
                                    className="overflow-y-auto px-5 pb-5"
                                    style={{ maxHeight: 'min(calc(70vh - 56px), 544px)' }}
                                >
                                    {THEME_GROUPS.map((group, groupIdx) => (
                                        <div key={group.label}>
                                            <div className={`flex items-center gap-2 ${groupIdx > 0 ? 'mt-4 pt-4 border-t border-[#00000010] dark:border-[#ffffff10]' : 'mt-1'}`}>
                                                <span className="text-[12px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-widest">{group.label}</span>
                                                <span className="text-[11px] text-[#b0b0b5] dark:text-[#666]">{group.themes.length} 款</span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                                {group.themes.map(theme => (
                                                    <button
                                                        key={theme.id}
                                                        onClick={() => {
                                                            onThemeChange(theme.id);
                                                            setIsThemeOpen(false);
                                                        }}
                                                        className={`relative flex flex-col items-start gap-1.5 p-3 rounded-xl text-left transition-all
                                                            ${activeTheme === theme.id
                                                                ? 'bg-[#0066cc]/8 dark:bg-[#0a84ff]/10 ring-2 ring-[#0066cc] dark:ring-[#0a84ff]'
                                                                : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] hover:bg-[#ebebed] dark:hover:bg-[#3a3a3c]'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between w-full">
                                                            <ThemeSwatch styles={theme.styles} />
                                                            {activeTheme === theme.id && <Check size={14} className="text-[#0066cc] dark:text-[#0a84ff]" />}
                                                        </div>
                                                        <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight">{theme.name}</span>
                                                        <span className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] leading-snug line-clamp-2">{theme.description}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Bottom fade scroll hint */}
                                <div
                                    className={`pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-[#1c1c1e] to-transparent transition-opacity duration-200 rounded-b-2xl ${showBottomFade ? 'opacity-100' : 'opacity-0'}`}
                                />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Theme description next to selectors */}
            <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-[#00000015] dark:border-[#ffffff15]">
                <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] font-medium tracking-wide truncate max-w-[300px] xl:max-w-[450px]">
                    <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold mr-1">{THEMES.find(t => t.id === activeTheme)?.name}：</span>
                    {THEMES.find(t => t.id === activeTheme)?.description}
                </p>
            </div>
        </div>
    );
}
