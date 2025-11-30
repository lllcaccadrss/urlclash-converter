// src/App.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  Button,
  Textarea,
  RadioGroup,
  Radio,
  Title1,
  Title3,
  Text,
  Switch,
  SwitchOnChangeData,
  Link,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import {
  ClipboardPasteRegular,
  CopyRegular,
  ArrowRightRegular,
  ArrowLeftRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
  LocalLanguageRegular,
} from '@fluentui/react-icons';
import { setParser, linkToClash, clashToLink } from './converter';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
  header: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    padding: '24px',
    boxShadow: tokens.shadow8,
    display: 'flex',
    justifyContent: 'center',
  },
  headerContent: {
    maxWidth: '1200px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitleArea: {
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '32px 24px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textarea: {
    height: '400px',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    fontFamily: 'monospace',
  },
  controls: {
    display: 'flex',
    gap: '8px',
  },
  options: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    padding: '16px',
  },
  actionButton: {
    marginTop: '8px',
  },
  themeButton: {
    color: tokens.colorNeutralForegroundOnBrand,
    ':hover': {
      color: tokens.colorNeutralForegroundOnBrand,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    ':active': {
      color: tokens.colorNeutralForegroundOnBrand,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    }
  },
  footer: {
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '24px',
    textAlign: 'center',
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke1),
  },
});

function AppContent({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) {

  const [usePyYaml, setUsePyYaml] = useState(false);
  const [pyLoading, setPyLoading] = useState(false);

  // 切换解析器
  const toggleParser = async (checked: boolean) => {
    setUsePyYaml(checked);
    setParser(checked ? 'py' : 'js');

    if (checked && clashInput.trim()) {
      setPyLoading(true);
      await clashToLink(clashInput); // 触发 Pyodide 预加载
      setPyLoading(false);
    }
  };

  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const [clashInput, setClashInput] = useState('');
  const [linksInput, setLinksInput] = useState('');
  const [outputMode, setOutputMode] = useState('proxies');

  const [copyLeftText, setCopyLeftText] = useState(t('copy'));
  const [pasteLeftText, setPasteLeftText] = useState(t('paste'));
  const [copyRightText, setCopyRightText] = useState(t('copy'));
  const [pasteRightText, setPasteRightText] = useState(t('paste'));

  useEffect(() => {
    document.title = t('title');
  }, [t]);

  useEffect(() => {
    // Update button texts when language changes
    setCopyLeftText(t('copy'));
    setPasteLeftText(t('paste'));
    setCopyRightText(t('copy'));
    setPasteRightText(t('paste'));
  }, [i18n.language, t]);  // Depend on language and t

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleCopy = async (text: string, buttonSetter: (text: string) => void, originalText: string) => {
    try {
      await navigator.clipboard.writeText(text);
      buttonSetter(t('copied'));
      setTimeout(() => buttonSetter(t('copy')), 800);  // Use t('copy') directly in timeout
    } catch (err) {
      alert(t('copy-failed'));
    }
  };

  const handlePaste = async (setter: (val: string) => void, buttonSetter: (text: string) => void, originalText: string) => {
    try {
      const text = await navigator.clipboard.readText();
      setter(text);
      buttonSetter(t('pasted'));
      setTimeout(() => buttonSetter(t('paste')), 800);  // Use t('paste') directly in timeout
    } catch (err) {
      alert(t('paste-failed'));
    }
  };

  const convertToLinks = async () => {
    const result = await clashToLink(clashInput);
    if (result.success) {
      setLinksInput(result.data);
    } else {
      setLinksInput(result.data); // Show error message
    }
  };

  const convertToClash = () => {
    const links = linksInput.split('\n').filter(line => line.trim() !== '');
    const result = linkToClash(links, outputMode as any);
    setClashInput(result.data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitleArea}>
            <Title1>{t('title')}</Title1>
            <Text>{t('subtitle')}</Text>
          </div>
          <div>
            <Button
              appearance="subtle"
              icon={<LocalLanguageRegular />}
              className={styles.themeButton}
              aria-label={t('language')}
              onClick={() => changeLanguage(i18n.language.startsWith('zh') ? 'en' : 'zh')}
            />
            <Button
              appearance="subtle"
              icon={isDark ? <WeatherSunnyRegular /> : <WeatherMoonRegular />}
              onClick={toggleTheme}
              className={styles.themeButton}
              aria-label={t('themeToggle')}
            />
          </div>
        </div>
      </div>

      <div className={styles.main}>
        {/* Left Column: Clash Config */}
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <Title3>{t('clashConfig')}</Title3>
            <div className={styles.controls}>
              <Button
                icon={<ClipboardPasteRegular />}
                onClick={() => handlePaste(setClashInput, setPasteLeftText, t('paste'))}
              >
                {pasteLeftText}
              </Button>
              <Button
                icon={<CopyRegular />}
                appearance="primary"
                onClick={() => handleCopy(clashInput, setCopyLeftText, t('copy'))}
              >
                {copyLeftText}
              </Button>
            </div>
          </div>
          <Textarea
            className={styles.textarea}
            value={clashInput}
            onChange={(e, data) => setClashInput(data.value)}
            placeholder={t('clashPlaceholder')}
            resize="none"
          />
          <Button
            className={styles.actionButton}
            appearance="primary"
            size="large"
            icon={<ArrowRightRegular />}
            iconPosition="after"
            onClick={convertToLinks}
          >
            {t('clashToLink')}
          </Button>
        </div>

        {/* Right Column: Links */}
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <Title3>{t('nodeLinks')}</Title3>
              <Text size={200} style={{ opacity: 0.7 }}>{t('onePerLine')}</Text>
            </div>
            <div className={styles.controls}>
              <Button
                icon={<ClipboardPasteRegular />}
                onClick={() => handlePaste(setLinksInput, setPasteRightText, t('paste'))}
              >
                {pasteRightText}
              </Button>
              <Button
                icon={<CopyRegular />}
                appearance="primary"
                onClick={() => handleCopy(linksInput, setCopyRightText, t('copy'))}
              >
                {copyRightText}
              </Button>
            </div>
          </div>

          {/* Engine Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: tokens.colorNeutralBackground3,
              padding: '12px 16px',
              borderRadius: tokens.borderRadiusMedium,
              border: `1px solid ${tokens.colorNeutralStroke1}`,
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* 状态小圆点 */}
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: usePyYaml ? '#16a34a' : '#71717a',
                  boxShadow: usePyYaml ? '0 0 10px rgba(22,163,74,0.6)' : 'none',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}
              />

              {/* 文字说明 */}
              <div>
                <Text weight="semibold" block>
                  {usePyYaml ? t('pyYamlEngine') : t('jsYamlEngine')}
                </Text>
                <Text size={200} style={{ opacity: 0.8 }}>
                  {usePyYaml ? t('pyYamlDesc') : t('jsYamlDesc')}
                  {pyLoading && <> · {t('switchingEngine')}</>}
                </Text>
              </div>
            </div>

            <Switch
              checked={usePyYaml}
              onChange={async (ev, data: SwitchOnChangeData) => {
                const checked = data.checked;
                setUsePyYaml(checked);
                setParser(checked ? 'py' : 'js');

                if (checked) {
                  setPyLoading(true);
                  try {
                    // 触发 PyYAML 引擎预加载（用最小合法 YAML 防止空输入报错）
                    await clashToLink(clashInput.trim() || 'proxies: []');
                  } finally {
                    setPyLoading(false);
                  }
                }
              }}
              label={
                <Text weight="medium">
                  {usePyYaml ? t('usingPyYaml') : t('usingJsYaml')}
                </Text>
              }
            />
          </div>

          <Textarea
            className={styles.textarea}
            value={linksInput}
            onChange={(e, data) => setLinksInput(data.value)}
            placeholder={t('linksPlaceholder')}
            resize="none"
          />

          <div className={styles.options}>
            <Text weight="semibold">{t('outputFormat')}</Text>
            <RadioGroup
              layout="horizontal"
              value={outputMode}
              onChange={(e, data) => setOutputMode(data.value)}
            >
              <Radio value="proxies" label="proxies:" />
              <Radio value="payload" label="payload:" />
              <Radio value="none" label={t('noPrefix')} />
            </RadioGroup>
          </div>

          <Button
            className={styles.actionButton}
            appearance="primary"
            size="large"
            icon={<ArrowLeftRegular />}
            onClick={convertToClash}
          >
            {t('linkToClash')}
          </Button>
        </div>
      </div>

      <footer className={styles.footer}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div>
            <Text>{t('github')}</Text>
            <Link href="https://github.com/siiway/urlclash-converter" target="_blank" rel="noopener noreferrer">
              siiway/urlclash-converter
            </Link>
          </div>
          <Text size={200} style={{ opacity: 0.8 }}>
            {t('madeWith')}<Link href="https://github.com/siiway/urlclash-converter/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>{t('license')}</Link>
          </Text>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  // Check system preference initially
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDark, setIsDark] = useState(systemPrefersDark);

  return (
    <FluentProvider theme={isDark ? webDarkTheme : webLightTheme}>
      <AppContent isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
    </FluentProvider>
  );
}