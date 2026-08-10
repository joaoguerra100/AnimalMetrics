import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Button, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import api from '@/services/api';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan.','Fev.','Mar','Abr','Mai','Jun','Jul.','Ago','Set.','Out.','Nov.','Dez.'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function AnimalDetails() {
  const { id, name } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [rationAmount, setRationAmount] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});

  const loadRecords = async () => {
  try {
    const response = await api.get(`/dailyrecords/animal/${id}?t=${new Date().getTime()}`);
    const data = response.data;
    setRecords(data);
    
    const newMarks: any = {};
    data.forEach((record: any) => {
      const dateKey = record.recordDate.split('T')[0];
      newMarks[dateKey] = {
        marked: true,
        dotColor: '#4CAF50'
      };
    });

    setMarkedDates(newMarks);
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSave = async () => {
    if (!rationAmount) return Alert.alert("Erro", "Digite a quantidade de ração");

    try {
      await api.post('/dailyrecords', {
        animalId: Number(id),
        foodGiven: Number(rationAmount),
        currentWeight: 0,
        recordDate: selectedDate
      });
      
      Alert.alert("Sucesso", `Registro ${isEditing ? 'atualizado' : 'salvo'} com sucesso!`);
      setModalVisible(false);
      setRationAmount('');
      
      // Zera o estado antigo e puxa tudo limpo do banco de dados
      setRecords([]); 
      await loadRecords();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar o registro");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: name as string, headerShown: true }} />

      <Calendar
        markedDates={markedDates}
        theme={{
          backgroundColor: '#1e1e1e',
          calendarBackground: '#1e1e1e',
          textSectionTitleColor: '#4CAF50',
          selectedDayBackgroundColor: '#4CAF50',
          dayTextColor: '#fff',
          monthTextColor: '#fff',
        }}
        onDayPress={(day: any) => {
        setSelectedDate(day.dateString); // Salva a string exata "2026-08-10"
        
        // Procura no array comparando apenas os primeiros 10 caracteres (AAAA-MM-DD)
        const existingRecord = records.find((r: any) => {
          const recordDateClean = r.recordDate.split('T')[0];
          return recordDateClean === day.dateString;
        });
        
        if (existingRecord) {
          setRationAmount(String(existingRecord.foodGiven));
          setIsEditing(true);
        } else {
          setRationAmount('');
          setIsEditing(false);
        }
        
        setModalVisible(true);
      }}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Atualizar Ração' : 'Novo Registro'} - {selectedDate}
            </Text>
            <Text>Quantidade de Ração (g):</Text>
            <TextInput 
              style={styles.input}
              keyboardType="numeric"
              value={rationAmount}
              onChangeText={setRationAmount}
              placeholder="Ex: 500"
            />
            <View style={styles.buttonRow}>
              <Button title="Cancelar" color="red" onPress={() => setModalVisible(false)} />
              <Button title={isEditing ? "Atualizar" : "Salvar"} onPress={handleSave} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 10 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#000' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginVertical: 15, color: '#000' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around' }
});