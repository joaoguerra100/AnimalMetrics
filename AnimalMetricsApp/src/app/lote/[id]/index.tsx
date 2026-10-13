import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const MENU_ITEMS = [
  { id: '1', title: 'Início', icon: 'home', lib: 'FontAwesome5', route: 'resumo' },
  { id: '2', title: 'Peso', icon: 'weight', lib: 'FontAwesome5', route: 'peso' },
  { id: '3', title: 'Sanidade', icon: 'needle', lib: 'MaterialCommunityIcons', route: 'sanidade' },
  { id: '4', title: 'Mortalidade', icon: 'skull', lib: 'FontAwesome5', route: 'mortalidade' },
  { id: '5', title: 'Alimentação', icon: 'seedling', lib: 'FontAwesome5', route: 'alimentacao' },
  { id: '6', title: 'Água', icon: 'water', lib: 'MaterialCommunityIcons', route: 'agua' },
  { id: '7', title: 'Manejo', icon: 'broom', lib: 'FontAwesome5', route: 'manejo' },
  { id: '8', title: 'Timeline', icon: 'calendar-alt', lib: 'FontAwesome5', route: 'timeline' },
];

export default function LoteDashboard() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const renderIcon = (lib: string, name: string) => {
    if (lib === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={name as any} size={32} color="#4CAF50" />;
    }
    return <FontAwesome5 name={name} size={32} color="#4CAF50" />;
  };

  return (
    <ScrollView style={styles.container}>
      {/* O header também precisa acompanhar o tema escuro */}
      <Stack.Screen 
        options={{ 
          title: 'Menu do Lote',
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#fff',
        }} 
      />
      
      <View style={styles.gridContainer}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            // O 'as any' burla o erro do TypeScript até criarmos as telas
            onPress={() => router.push(`/lote/${id}/${item.route}` as any)}
          >
            <View style={styles.iconContainer}>
              {renderIcon(item.lib, item.icon)}
            </View>
            <Text style={styles.cardTitle} numberOfLines={2} adjustsFontSizeToFit>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Fundo escuro
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1e1e1e', // Cor dos cartões (um pouco mais clara que o fundo)
    width: '30%', 
    aspectRatio: 1, 
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombras mantidas, mas quase imperceptíveis no escuro (pode ser útil se trocar para tema claro depois)
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    // Adicionando uma borda sutil para destacar os cartões no escuro
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  iconContainer: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff', // Texto branco
    textAlign: 'center',
  },
});