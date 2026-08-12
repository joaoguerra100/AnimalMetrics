import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import api from '@/services/api';
import AnimalCard from '@/components/AnimalCard'; // Importando seu componente limpo

export default function Home() {
  const [animals, setAnimals] = useState<any[]>([]);

  useEffect(() => {
    async function loadAnimals() {
      try {
        const response = await api.get('/animals');
        setAnimals(response.data);
      } catch (error) {
        console.error("Erro ao buscar animais", error);
      }
    }
    loadAnimals();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Animais</Text>
      
      <FlatList
        data={animals}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <AnimalCard id={item.id} name={item.name} type={item.type} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }
});