import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Polyline, Text as SvgText } from 'react-native-svg';
import { MOM_THEME } from '../theme/colors';
import { GrowthMetric, WHO_MAX_MONTH, whoTable } from '../utils/who';

export interface GrowthPoint {
  month: number;
  value: number;
}

const HEIGHT = 220;
const PAD = { left: 36, right: 12, top: 12, bottom: 28 };

/** Biểu đồ tăng trưởng: dải chuẩn WHO P3-P97, đường trung vị P50 và các lần đo của bé. */
export default function GrowthChart({
  metric,
  isBoy,
  points,
}: {
  metric: GrowthMetric;
  isBoy: boolean;
  points: GrowthPoint[];
}) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const table = whoTable(metric, isBoy);
  const maxMonth = Math.max(WHO_MAX_MONTH, ...points.map((p) => Math.ceil(p.month)));
  const values = [...table.flatMap((r) => [r.P3, r.P97]), ...points.map((p) => p.value)];
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const step = metric === 'weight' ? 2 : 10;
  const yMin = Math.floor(rawMin / step) * step;
  const yMax = Math.ceil(rawMax / step) * step;

  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (month: number) => PAD.left + (month / maxMonth) * plotW;
  const y = (value: number) => PAD.top + (1 - (value - yMin) / (yMax - yMin)) * plotH;

  const band = [
    ...table.map((r) => `${x(r.month)},${y(r.P97)}`),
    ...[...table].reverse().map((r) => `${x(r.month)},${y(r.P3)}`),
  ].join(' ');
  const median = table.map((r) => `${x(r.month)},${y(r.P50)}`).join(' ');
  const sorted = [...points].sort((a, b) => a.month - b.month);
  const babyLine = sorted.map((p) => `${x(p.month)},${y(p.value)}`).join(' ');

  const yTicks: number[] = [];
  for (let v = yMin; v <= yMax; v += step) yTicks.push(v);
  const xTicks: number[] = [];
  for (let m = 0; m <= maxMonth; m += 6) xTicks.push(m);

  return (
    <View onLayout={onLayout}>
      {width > 0 ? (
        <Svg width={width} height={HEIGHT}>
          {yTicks.map((v) => (
            <React.Fragment key={`y${v}`}>
              <Line x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} stroke={MOM_THEME.borderSoft} strokeWidth={1} />
              <SvgText x={PAD.left - 6} y={y(v) + 4} fontSize={10} fill={MOM_THEME.muted} textAnchor="end">
                {v}
              </SvgText>
            </React.Fragment>
          ))}
          {xTicks.map((m) => (
            <SvgText key={`x${m}`} x={x(m)} y={HEIGHT - 8} fontSize={10} fill={MOM_THEME.muted} textAnchor="middle">
              {m}
            </SvgText>
          ))}
          <Polygon points={band} fill={MOM_THEME.sageLight} />
          <Polyline points={median} fill="none" stroke={MOM_THEME.sageDark} strokeWidth={1.5} strokeDasharray="5,4" />
          {sorted.length > 1 ? (
            <Polyline points={babyLine} fill="none" stroke={MOM_THEME.roseDark} strokeWidth={2.5} />
          ) : null}
          {sorted.map((p, i) => (
            <Circle
              key={`p${i}`}
              cx={x(p.month)}
              cy={y(p.value)}
              r={i === sorted.length - 1 ? 5 : 3.5}
              fill={MOM_THEME.roseDark}
              stroke={MOM_THEME.white}
              strokeWidth={1.5}
            />
          ))}
        </Svg>
      ) : (
        <View style={{ height: HEIGHT }} />
      )}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: MOM_THEME.sageLight }]} />
          <Text style={styles.legendText}>Chuẩn WHO (P3–P97)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dash, { borderColor: MOM_THEME.sageDark }]} />
          <Text style={styles.legendText}>Trung vị</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: MOM_THEME.roseDark }]} />
          <Text style={styles.legendText}>Bé</Text>
        </View>
      </View>
      <Text style={styles.axisNote}>
        Trục ngang: tháng tuổi · Trục dọc: {metric === 'weight' ? 'kg' : 'cm'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 14,
    height: 10,
    borderRadius: 2,
  },
  dash: {
    width: 14,
    borderTopWidth: 2,
    borderStyle: 'dashed',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: MOM_THEME.muted,
    fontSize: 12,
  },
  axisNote: {
    color: MOM_THEME.mutedLight,
    fontSize: 11,
    marginTop: 4,
  },
});
