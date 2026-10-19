import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { FavoriteBooksPicker } from '@/components/onboarding/FavoriteBooksPicker';
import { GoalPicker } from '@/components/onboarding/GoalPicker';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { StepShell } from '@/components/onboarding/StepShell';
import { Welcome } from '@/components/onboarding/Welcome';
import { PACE_GOALS, usernameFrom, type ReadingPace } from '@/data/library';
import { GENRES, MOODS, type GenreId, type MoodId } from '@/data/taxonomy';
import { useI18n } from '@/i18n/I18nProvider';
import { useLibrary } from '@/store/LibraryProvider';
import { colors, fonts, radius, space, type } from '@/theme/tokens';

const PACES: { id: ReadingPace; emoji: string }[] = [
  { id: 'casual', emoji: '☕' },
  { id: 'regular', emoji: '📚' },
  { id: 'avid', emoji: '🔥' },
];

const TOTAL = 6;

function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

/**
 * Welcome questionnaire. Today it runs on first launch; once accounts exist
 * (Supabase) it runs right after sign-up and the answers sync to the profile.
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { dispatch } = useLibrary();

  const [step, setStep] = useState(0); // 0 = welcome
  const [name, setName] = useState('');
  const [pace, setPace] = useState<ReadingPace>();
  const [genres, setGenres] = useState<GenreId[]>([]);
  const [moods, setMoods] = useState<MoodId[]>([]);
  const [books, setBooks] = useState<string[]>([]);
  const [goal, setGoal] = useState(PACE_GOALS.regular);
  const [goalTouched, setGoalTouched] = useState(false);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  if (step === 0) {
    return (
      <Welcome
        onStart={next}
        onDemo={() => {
          dispatch({ type: 'startDemo' });
          router.replace('/');
        }}
      />
    );
  }

  const finish = () => {
    dispatch({
      type: 'completeOnboarding',
      answers: {
        name,
        readingPace: pace ?? 'regular',
        favoriteGenres: genres,
        favoriteMoods: moods,
        favoriteBookIds: books,
        yearlyGoal: goal,
      },
    });
    router.replace({ pathname: '/guide', params: { first: '1' } });
  };

  const common = { step, total: TOTAL, onBack: back, onNext: step === TOTAL ? finish : next };

  switch (step) {
    case 1:
      return (
        <StepShell
          {...common}
          title={t('onb.name.title')}
          subtitle={t('onb.name.sub')}
          cta={t('onb.continue')}
          ctaDisabled={!name.trim()}
        >
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('onb.name.placeholder')}
            placeholderTextColor={colors.textFaint}
            autoFocus
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => name.trim() && next()}
            style={styles.nameInput}
          />
          {name.trim() ? (
            <Text style={[type.small, { marginTop: space.md }]}>
              {t('onb.name.handle', { username: usernameFrom(name) })}
            </Text>
          ) : null}
        </StepShell>
      );

    case 2:
      return (
        <StepShell
          {...common}
          title={t('onb.pace.title')}
          subtitle={t('onb.pace.sub')}
          cta={t('onb.continue')}
          ctaDisabled={!pace}
        >
          <View style={{ gap: space.sm }}>
            {PACES.map((p) => (
              <OptionCard
                key={p.id}
                emoji={p.emoji}
                title={t(`onb.pace.${p.id}`)}
                description={t(`onb.pace.${p.id}.desc`)}
                selected={pace === p.id}
                onPress={() => {
                  setPace(p.id);
                  if (!goalTouched) setGoal(PACE_GOALS[p.id]);
                }}
              />
            ))}
          </View>
        </StepShell>
      );

    case 3:
      return (
        <StepShell
          {...common}
          title={t('onb.genres.title')}
          subtitle={t('onb.genres.sub')}
          cta={t('onb.continue')}
          ctaDisabled={!genres.length}
        >
          <View style={styles.grid}>
            {GENRES.map((g) => (
              <OptionCard
                key={g.id}
                compact
                emoji={g.emoji}
                title={g.label[locale]}
                selected={genres.includes(g.id)}
                onPress={() => setGenres((list) => toggle(list, g.id))}
              />
            ))}
          </View>
        </StepShell>
      );

    case 4:
      return (
        <StepShell
          {...common}
          title={t('onb.moods.title')}
          subtitle={t('onb.moods.sub')}
          cta={t('onb.continue')}
          ctaDisabled={!moods.length}
        >
          <View style={{ gap: space.sm }}>
            {MOODS.map((m) => (
              <OptionCard
                key={m.id}
                emoji={m.emoji}
                title={m.label[locale]}
                description={m.hint[locale]}
                selected={moods.includes(m.id)}
                onPress={() => setMoods((list) => toggle(list, m.id))}
              />
            ))}
          </View>
        </StepShell>
      );

    case 5:
      return (
        <StepShell
          {...common}
          title={t('onb.books.title')}
          subtitle={t('onb.books.sub')}
          cta={books.length ? `${t('onb.continue')} · ${books.length}` : t('onb.continue')}
          ctaDisabled={!books.length}
        >
          <FavoriteBooksPicker selected={books} onToggle={(b) => setBooks((list) => toggle(list, b.id))} />
        </StepShell>
      );

    default:
      return (
        <StepShell
          {...common}
          title={t('onb.goal.title', { year: new Date().getFullYear() })}
          subtitle={t('onb.goal.sub')}
          cta={t('onb.goal.cta')}
        >
          <GoalPicker
            value={goal}
            suggested={PACE_GOALS[pace ?? 'regular']}
            onChange={(n) => {
              setGoalTouched(true);
              setGoal(n);
            }}
          />
        </StepShell>
      );
  }
}

const styles = StyleSheet.create({
  nameInput: {
    height: 60,
    paddingHorizontal: space.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
