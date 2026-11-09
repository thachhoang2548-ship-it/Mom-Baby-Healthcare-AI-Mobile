import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronDown, ChevronUp, Heart, Sparkles } from 'lucide-react-native';
import {
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Field,
  LoadingView,
  PrimaryButton,
  Screen,
  SectionTitle,
  uiStyles,
} from '../../components/ui';
import featureService, { RecipeDto } from '../../services/featureService';
import { getApiErrorMessage } from '../../utils/apiError';
import { MOM_THEME, RADII, SHADOWS } from '../../theme/colors';
import { useAccent } from '../../theme/accent';
import { useT } from '../../i18n';

// Giá trị gửi lên server giữ tiếng Việt (AI tạo món theo đó); tiếng Anh chỉ để hiển thị.
const DIET_EN: Record<string, string> = {
  'Mẹ bầu': 'Pregnant',
  'Mẹ sau sinh cho con bú': 'Breastfeeding',
  'Ăn chay': 'Vegetarian',
  'Ít đường (tiểu đường thai kỳ)': 'Low sugar (gestational diabetes)',
};
const DIETS = Object.keys(DIET_EN);
const COOK_TIMES = [15, 30, 45];
const DIFFICULTY: Record<string, [string, string]> = {
  Easy: ['Dễ', 'Easy'],
  Medium: ['Trung bình', 'Medium'],
  Hard: ['Khó', 'Hard'],
};

const parseList = (json?: string): string[] => {
  try {
    const value = JSON.parse(json || '[]');
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
};

export default function RecipesScreen() {
  const a = useAccent();
  const t = useT();
  const [recipes, setRecipes] = useState<RecipeDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'saved'>('all');
  const [openId, setOpenId] = useState<number | null>(null);

  const [diet, setDiet] = useState(DIETS[0]);
  const [allergies, setAllergies] = useState('');
  const [cookTime, setCookTime] = useState(30);
  const [ingredients, setIngredients] = useState('');
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await featureService.getMyRecipes({ category: 'Mom' });
      setRecipes(data?.recipes ?? []);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const generate = async () => {
    setGenerating(true);
    try {
      await featureService.generateRecipes({
        dietType: diet,
        allergies: allergies.trim() || 'Không',
        maxCookTime: cookTime,
        availableIngredients: ingredients.trim() || 'Không',
      });
      setTab('all');
      await load();
      Alert.alert(
        t('Đã tạo món mới', 'New dishes ready'),
        t('Các món mới đã được gửi tới chuyên gia dinh dưỡng xét duyệt.', 'The new dishes have been sent to a nutritionist for review.')
      );
    } catch (err) {
      Alert.alert(t('Chưa tạo được món', 'Could not create dishes'), getApiErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const toggleSave = async (recipe: RecipeDto) => {
    try {
      const res = await featureService.toggleSaveRecipe(recipe.id);
      setRecipes((prev) => prev?.map((r) => (r.id === recipe.id ? { ...r, isSaved: res.isSaved } : r)) ?? prev);
    } catch (err) {
      Alert.alert(t('Chưa lưu được', 'Could not save'), getApiErrorMessage(err));
    }
  };

  // Giống web: món chuyên gia đã từ chối không hiện cho mẹ.
  const visible = (recipes ?? []).filter((r) => r.status !== 'Rejected');
  const rejectedCount = (recipes ?? []).length - visible.length;
  const shown = tab === 'saved' ? visible.filter((r) => r.isSaved) : visible;

  return (
    <Screen
      eyebrow={t('Dinh dưỡng cho mẹ', 'Nutrition for you')}
      title={t('Món ăn AI', 'AI recipes')}
      subtitle={t(
        'Gợi ý món theo chế độ ăn và nguyên liệu mẹ đang có. Món mới được chuyên gia dinh dưỡng xét duyệt.',
        'Dish ideas for your diet and the ingredients you have, reviewed by a nutritionist. Recipes are written in Vietnamese.'
      )}
    >
      <Card>
        <Text style={uiStyles.label}>{t('Chế độ ăn', 'Diet')}</Text>
        <View style={[uiStyles.rowWrap, styles.gap]}>
          {DIETS.map((d) => (
            <Chip key={d} label={t(d, DIET_EN[d])} selected={diet === d} onPress={() => setDiet(d)} />
          ))}
        </View>
        <Text style={uiStyles.label}>{t('Thời gian nấu tối đa', 'Max cooking time')}</Text>
        <View style={[uiStyles.rowWrap, styles.gap]}>
          {COOK_TIMES.map((m) => (
            <Chip key={m} label={t(`${m} phút`, `${m} min`)} selected={cookTime === m} onPress={() => setCookTime(m)} />
          ))}
        </View>
        <Field
          label={t('Nguyên liệu đang có', 'Ingredients you have')}
          value={ingredients}
          onChangeText={setIngredients}
          placeholder={t('VD: thịt bò, bí đỏ, cà rốt', 'e.g. beef, pumpkin, carrot')}
        />
        <Field
          label={t('Dị ứng (nếu có)', 'Allergies (if any)')}
          value={allergies}
          onChangeText={setAllergies}
          placeholder={t('VD: tôm, đậu phộng', 'e.g. shrimp, peanuts')}
        />
        <PrimaryButton
          label={generating ? t('AI đang gợi ý món...', 'AI is thinking...') : t('Gợi ý món ăn', 'Suggest dishes')}
          icon={<Sparkles size={16} color={MOM_THEME.white} />}
          onPress={generate}
          loading={generating}
        />
      </Card>

      <SectionTitle
        title={t('Món của mẹ', 'Your dishes')}
        right={
          <View style={uiStyles.rowWrap}>
            <Chip label={t('Tất cả', 'All')} selected={tab === 'all'} onPress={() => setTab('all')} />
            <Chip
              label={`${t('Đã lưu', 'Saved')} (${visible.filter((r) => r.isSaved).length})`}
              selected={tab === 'saved'}
              onPress={() => setTab('saved')}
            />
          </View>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : recipes === null ? (
        <LoadingView />
      ) : shown.length === 0 ? (
        <EmptyState
          emoji={tab === 'saved' ? '🔖' : '🍲'}
          title={tab === 'saved' ? t('Chưa lưu món nào', 'No saved dishes') : t('Chưa có món nào', 'No dishes yet')}
          body={
            tab === 'saved'
              ? t('Bấm biểu tượng trái tim trên một món để lưu vào sổ tay.', 'Tap the heart on a dish to save it.')
              : t('Chọn chế độ ăn và nguyên liệu ở trên để AI gợi ý món cho mẹ.', 'Pick a diet and ingredients above to get AI dish ideas.')
          }
        />
      ) : (
        shown.map((recipe) => {
          const open = openId === recipe.id;
          const approved = recipe.status === 'Approved';
          const ingredientList = parseList(recipe.ingredientsJson);
          const steps = parseList(recipe.stepsJson);
          return (
            <View key={recipe.id} style={[styles.recipe, SHADOWS.sm]}>
              <TouchableOpacity
                style={styles.recipeHead}
                onPress={() => setOpenId(open ? null : recipe.id)}
                activeOpacity={0.85}
              >
                <View style={styles.flex}>
                  <View style={[styles.status, approved ? styles.statusOk : styles.statusPending]}>
                    <Text style={[styles.statusText, approved ? styles.statusOkText : styles.statusPendingText]}>
                      {approved ? t('Chuyên gia đã duyệt', 'Nutritionist approved') : t('Chờ chuyên gia duyệt', 'Awaiting review')}
                    </Text>
                  </View>
                  <Text style={styles.title}>{recipe.title}</Text>
                  <Text style={uiStyles.muted}>
                    {[
                      recipe.calories ? `${Math.round(recipe.calories)} kcal` : null,
                      recipe.prepTimeMinutes ? `${recipe.prepTimeMinutes} ${t('phút', 'min')}` : null,
                      recipe.difficulty
                        ? DIFFICULTY[recipe.difficulty]
                          ? t(...DIFFICULTY[recipe.difficulty])
                          : recipe.difficulty
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleSave(recipe)}
                  style={styles.save}
                  accessibilityLabel={recipe.isSaved ? t('Bỏ lưu món', 'Unsave dish') : t('Lưu món', 'Save dish')}
                >
                  <Heart
                    size={20}
                    color={a.primary}
                    fill={recipe.isSaved ? a.primary : 'transparent'}
                  />
                </TouchableOpacity>
                {open ? <ChevronUp size={18} color={MOM_THEME.muted} /> : <ChevronDown size={18} color={MOM_THEME.muted} />}
              </TouchableOpacity>
              {open ? (
                <View style={styles.body}>
                  {recipe.expertNote ? (
                    <Text style={styles.expertNote}>
                      {t('Chuyên gia:', 'Nutritionist:')} {recipe.expertNote}
                    </Text>
                  ) : null}
                  {recipe.protein || recipe.carbs || recipe.fat ? (
                    <Text style={uiStyles.muted}>
                      {t('Đạm', 'Protein')} {recipe.protein ?? 0}g · {t('Tinh bột', 'Carbs')} {recipe.carbs ?? 0}g ·{' '}
                      {t('Béo', 'Fat')} {recipe.fat ?? 0}g
                    </Text>
                  ) : null}
                  {ingredientList.length ? (
                    <>
                      <Text style={styles.subTitle}>{t('Nguyên liệu', 'Ingredients')}</Text>
                      {ingredientList.map((item, i) => (
                        <Text key={i} style={uiStyles.body}>
                          • {item}
                        </Text>
                      ))}
                    </>
                  ) : null}
                  {steps.length ? (
                    <>
                      <Text style={styles.subTitle}>{t('Cách làm', 'Steps')}</Text>
                      {steps.map((s, i) => (
                        <Text key={i} style={uiStyles.body}>
                          {i + 1}. {s}
                        </Text>
                      ))}
                    </>
                  ) : null}
                  {!approved ? (
                    <Text style={styles.pendingNote}>
                      {t(
                        'Món do AI gợi ý, chưa được chuyên gia kiểm tra. Mẹ lưu ý nấu chín kỹ và tránh thực phẩm sống khi mang thai.',
                        'AI-suggested and not yet checked by a nutritionist. Cook food thoroughly and avoid raw food during pregnancy.'
                      )}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        })
      )}
      {rejectedCount > 0 && tab === 'all' ? (
        <Text style={[uiStyles.muted, styles.rejected]}>
          {t(
            `${rejectedCount} món đã bị chuyên gia từ chối nên không hiển thị.`,
            `${rejectedCount} dish(es) were rejected by a nutritionist and are hidden.`
          )}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  gap: {
    marginBottom: 12,
  },
  recipe: {
    backgroundColor: MOM_THEME.white,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: MOM_THEME.borderSoft,
    marginBottom: 10,
  },
  recipeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
  },
  status: {
    alignSelf: 'flex-start',
    borderRadius: RADII.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  statusOk: {
    backgroundColor: MOM_THEME.sageLight,
  },
  statusPending: {
    backgroundColor: MOM_THEME.amberLight,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusOkText: {
    color: MOM_THEME.sageDark,
  },
  statusPendingText: {
    color: MOM_THEME.amberDark,
  },
  title: {
    color: MOM_THEME.charcoal,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  save: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 4,
  },
  subTitle: {
    color: MOM_THEME.charcoal,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
  },
  expertNote: {
    color: MOM_THEME.sageDark,
    fontSize: 13,
    fontWeight: '600',
  },
  pendingNote: {
    color: MOM_THEME.amberDark,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 8,
  },
  rejected: {
    textAlign: 'center',
    marginTop: 4,
  },
});
