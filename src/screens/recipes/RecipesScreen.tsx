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

const DIETS = ['Mẹ bầu', 'Mẹ sau sinh cho con bú', 'Ăn chay', 'Ít đường (tiểu đường thai kỳ)'];
const COOK_TIMES = [15, 30, 45];
const DIFFICULTY: Record<string, string> = { Easy: 'Dễ', Medium: 'Trung bình', Hard: 'Khó' };

const parseList = (json?: string): string[] => {
  try {
    const value = JSON.parse(json || '[]');
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
};

export default function RecipesScreen() {
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
      Alert.alert('Đã tạo món mới', 'Các món mới đã được gửi tới chuyên gia dinh dưỡng xét duyệt.');
    } catch (err) {
      Alert.alert('Chưa tạo được món', getApiErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const toggleSave = async (recipe: RecipeDto) => {
    try {
      const res = await featureService.toggleSaveRecipe(recipe.id);
      setRecipes((prev) => prev?.map((r) => (r.id === recipe.id ? { ...r, isSaved: res.isSaved } : r)) ?? prev);
    } catch (err) {
      Alert.alert('Chưa lưu được', getApiErrorMessage(err));
    }
  };

  // Giống web: món chuyên gia đã từ chối không hiện cho mẹ.
  const visible = (recipes ?? []).filter((r) => r.status !== 'Rejected');
  const rejectedCount = (recipes ?? []).length - visible.length;
  const shown = tab === 'saved' ? visible.filter((r) => r.isSaved) : visible;

  return (
    <Screen
      eyebrow="Dinh dưỡng cho mẹ"
      title="Món ăn AI"
      subtitle="Gợi ý món theo chế độ ăn và nguyên liệu mẹ đang có. Món mới được chuyên gia dinh dưỡng xét duyệt."
    >
      <Card>
        <Text style={uiStyles.label}>Chế độ ăn</Text>
        <View style={[uiStyles.rowWrap, styles.gap]}>
          {DIETS.map((d) => (
            <Chip key={d} label={d} selected={diet === d} onPress={() => setDiet(d)} />
          ))}
        </View>
        <Text style={uiStyles.label}>Thời gian nấu tối đa</Text>
        <View style={[uiStyles.rowWrap, styles.gap]}>
          {COOK_TIMES.map((m) => (
            <Chip key={m} label={`${m} phút`} selected={cookTime === m} onPress={() => setCookTime(m)} />
          ))}
        </View>
        <Field
          label="Nguyên liệu đang có"
          value={ingredients}
          onChangeText={setIngredients}
          placeholder="VD: thịt bò, bí đỏ, cà rốt"
        />
        <Field label="Dị ứng (nếu có)" value={allergies} onChangeText={setAllergies} placeholder="VD: tôm, đậu phộng" />
        <PrimaryButton
          label={generating ? 'AI đang gợi ý món...' : 'Gợi ý món ăn'}
          icon={<Sparkles size={16} color={MOM_THEME.white} />}
          onPress={generate}
          loading={generating}
        />
      </Card>

      <SectionTitle
        title="Món của mẹ"
        right={
          <View style={uiStyles.rowWrap}>
            <Chip label="Tất cả" selected={tab === 'all'} onPress={() => setTab('all')} />
            <Chip
              label={`Đã lưu (${visible.filter((r) => r.isSaved).length})`}
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
          title={tab === 'saved' ? 'Chưa lưu món nào' : 'Chưa có món nào'}
          body={
            tab === 'saved'
              ? 'Bấm biểu tượng trái tim trên một món để lưu vào sổ tay.'
              : 'Chọn chế độ ăn và nguyên liệu ở trên để AI gợi ý món cho mẹ.'
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
                      {approved ? 'Chuyên gia đã duyệt' : 'Chờ chuyên gia duyệt'}
                    </Text>
                  </View>
                  <Text style={styles.title}>{recipe.title}</Text>
                  <Text style={uiStyles.muted}>
                    {[
                      recipe.calories ? `${Math.round(recipe.calories)} kcal` : null,
                      recipe.prepTimeMinutes ? `${recipe.prepTimeMinutes} phút` : null,
                      recipe.difficulty ? DIFFICULTY[recipe.difficulty] ?? recipe.difficulty : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleSave(recipe)}
                  style={styles.save}
                  accessibilityLabel={recipe.isSaved ? 'Bỏ lưu món' : 'Lưu món'}
                >
                  <Heart
                    size={20}
                    color={MOM_THEME.roseDark}
                    fill={recipe.isSaved ? MOM_THEME.roseDark : 'transparent'}
                  />
                </TouchableOpacity>
                {open ? <ChevronUp size={18} color={MOM_THEME.muted} /> : <ChevronDown size={18} color={MOM_THEME.muted} />}
              </TouchableOpacity>
              {open ? (
                <View style={styles.body}>
                  {recipe.expertNote ? (
                    <Text style={styles.expertNote}>Chuyên gia: {recipe.expertNote}</Text>
                  ) : null}
                  {recipe.protein || recipe.carbs || recipe.fat ? (
                    <Text style={uiStyles.muted}>
                      Đạm {recipe.protein ?? 0}g · Tinh bột {recipe.carbs ?? 0}g · Béo {recipe.fat ?? 0}g
                    </Text>
                  ) : null}
                  {ingredientList.length ? (
                    <>
                      <Text style={styles.subTitle}>Nguyên liệu</Text>
                      {ingredientList.map((item, i) => (
                        <Text key={i} style={uiStyles.body}>
                          • {item}
                        </Text>
                      ))}
                    </>
                  ) : null}
                  {steps.length ? (
                    <>
                      <Text style={styles.subTitle}>Cách làm</Text>
                      {steps.map((s, i) => (
                        <Text key={i} style={uiStyles.body}>
                          {i + 1}. {s}
                        </Text>
                      ))}
                    </>
                  ) : null}
                  {!approved ? (
                    <Text style={styles.pendingNote}>
                      Món do AI gợi ý, chưa được chuyên gia kiểm tra. Mẹ lưu ý nấu chín kỹ và tránh thực phẩm sống khi mang thai.
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
          {rejectedCount} món đã bị chuyên gia từ chối nên không hiển thị.
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
