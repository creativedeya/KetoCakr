// ===========================================================
// TOOLS SCREEN - Quick Tools + Knowledge Base
// ===========================================================
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTranslation } from '../../../constants/i18n';

// wrappers matching previous icon names
const Ruler = (props: any) => <Ionicons name="ruler" {...props} />;
const Timer = (props: any) => <Ionicons name="timer" {...props} />;
const RefreshCw = (props: any) => <Ionicons name="refresh" {...props} />;
const Calculator = (props: any) => <Ionicons name="calculator" {...props} />;

export default function ToolsScreen() {
  const { t } = useTranslation();

  const showPremiumAlert = () => {
    Alert.alert(t('alerts.premium.title'), t('alerts.premium.message'), [{ text: 'OK' }]);
  };

  const tools = [
    {
      icon: Ruler,
      title: t('tools.items.converter.title'),
      description: t('tools.items.converter.description'),
      premium: false,
      onPress: () => Alert.alert(t('tools.items.converter.title'), t('alerts.comingSoon')),
    },
    {
      icon: Timer,
      title: t('tools.items.timer.title'),
      description: t('tools.items.timer.description'),
      premium: false,
      onPress: () => Alert.alert(t('tools.items.timer.title'), t('alerts.comingSoon')),
    },
    {
      icon: RefreshCw,
      title: t('tools.items.panSizes.title'),
      description: t('tools.items.panSizes.description'),
      premium: true,
      onPress: showPremiumAlert,
    },
    {
      icon: Calculator,
      title: t('tools.items.macroCalculator.title'),
      description: t('tools.items.macroCalculator.description'),
      premium: true,
      onPress: showPremiumAlert,
    },
  ];

  const knowledgeBase = [
    {
      icon: '🥥',
      title: t('tools.items.encyclopedia.title'),
      subtitle: t('tools.items.encyclopedia.subtitle'),
    },
    {
      icon: '🔄',
      title: t('tools.items.substitutes.title'),
      subtitle: t('tools.items.substitutes.subtitle'),
    },
    {
      icon: '👨‍🍳',
      title: t('tools.items.techniques.title'),
      subtitle: t('tools.items.techniques.subtitle'),
    },
    {
      icon: '📊',
      title: t('tools.items.nutrition.title'),
      subtitle: t('tools.items.nutrition.subtitle'),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <ScrollView>
        {/* Header */}
        <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
          <Text style={{ fontSize: 30, fontWeight: 'bold', color: Colors.text.primary }}>
            {t('tools.title')}
          </Text>
          <Text style={{ fontSize: 16, color: Colors.text.secondary, marginTop: 5 }}>
            {t('tools.subtitle')}
          </Text>
        </View>

        {/* Quick Tools */}
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: Colors.text.primary,
            marginBottom: 15,
          }}>
            {t('tools.quickTools')}
          </Text>

          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 15,
          }}>
            {tools.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={tool.onPress}
                  style={{
                    width: '47%',
                    backgroundColor: Colors.background.secondary,
                    borderWidth: 2,
                    borderColor: Colors.border.light,
                    borderRadius: 15,
                    padding: 20,
                    alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Premium Badge */}
                  {tool.premium && (
                    <View style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}>
                      <Text style={{ fontSize: 16 }}>👑</Text>
                    </View>
                  )}

                  {/* Icon */}
                  <View style={{
                    width: 50,
                    height: 50,
                    backgroundColor: tool.premium ? Colors.warning.main : Colors.primary.main,
                    borderRadius: 15,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}>
                    <IconComponent size={24} color={Colors.background.primary} />
                  </View>

                  {/* Title */}
                  <Text style={{
                    fontWeight: 'bold',
                    fontSize: 14,
                    color: Colors.text.primary,
                    textAlign: 'center',
                    marginBottom: 6,
                  }}>
                    {tool.title}
                  </Text>

                  {/* Description */}
                  <Text style={{
                    fontSize: 12,
                    color: Colors.text.secondary,
                    textAlign: 'center',
                    lineHeight: 16,
                  }}>
                    {tool.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Knowledge Base */}
        <View style={{ backgroundColor: Colors.background.secondary, padding: 20 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: Colors.text.primary,
            marginBottom: 15,
          }}>
            {t('tools.knowledgeBase')}
          </Text>

          <View style={{ gap: 10 }}>
            {knowledgeBase.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => Alert.alert(item.title, t('alerts.comingSoon'))}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.background.primary,
                  padding: 15,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Colors.border.light,
                }}
              >
                <View style={{
                  width: 50,
                  height: 50,
                  backgroundColor: Colors.background.secondary,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 15,
                }}>
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: Colors.text.primary,
                    marginBottom: 3,
                  }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: Colors.text.secondary }}>
                    {item.subtitle}
                  </Text>
                </View>
                <Text style={{ color: Colors.border.dark, fontSize: 20 }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={{ padding: 20 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: Colors.text.primary,
            marginBottom: 15,
          }}>
            {t('tools.tipsOfDay')}
          </Text>

          <View style={{
            backgroundColor: Colors.primary.opacity[10],
            borderLeftWidth: 4,
            borderLeftColor: Colors.primary.main,
            padding: 15,
            borderRadius: 12,
          }}>
            <Text style={{
              fontSize: 14,
              color: Colors.text.primary,
              lineHeight: 20,
            }}>
              {t('tools.tipText')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
