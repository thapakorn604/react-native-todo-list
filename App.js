import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

// Component for a single TODO item
const TodoItem = ({ item, onToggle, onDelete, onEdit, isEditing, onSave }) => {
  const [editText, setEditText] = useState(item.text);

  if (isEditing) {
    return (
      <View style={[styles.todoItem, styles.editingItem]}>
        <TextInput
          style={styles.textInput}
          onChangeText={setEditText}
          value={editText}
          autoFocus
        />
        <Button title="Save" onPress={() => onSave(item.id, editText)} />
      </View>
    );
  }

  return (
    <View style={styles.todoItem}>
      <TouchableOpacity
        onPress={() => onToggle(item.id)}
        style={styles.todoItemLeft}
      >
        <Text style={item.completed ? styles.todoTextCompleted : styles.todoText}>
          {item.text}
        </Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <Button title="Edit" onPress={() => onEdit(item.id)} />
        <View style={styles.buttonSpacer} />
        <Button title="Delete" color="red" onPress={() => onDelete(item.id)} />
      </View>
    </View>
  );
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    // Check for biometric support on component mount
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      setBiometricAvailable(hasHardware);

      const isBiometricEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsEnrolled(isBiometricEnrolled);
    })();
  }, []);

  // Function to handle biometric authentication
  const handleAuthentication = async () => {
    // Check if hardware is available and biometrics are enrolled
    if (!biometricAvailable || !isEnrolled) {
      alert('Biometric authentication is not available on this device.');
      return false;
    }

    const { success } = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access your TODO list.',
      fallbackLabel: 'Use passcode',
    });

    if (success) {
      setIsAuthenticated(true);
    } else {
      alert('Authentication failed.');
      setIsAuthenticated(false);
    }
    return success;
  };

  // Function to add a new TODO item
  const handleAddTodo = async () => {
    if (!newTodoText.trim()) {
      alert('Please enter a TODO item.');
      return;
    }

    const authSuccess = await handleAuthentication();
    if (authSuccess) {
      setTodos((currentTodos) => [
        ...currentTodos,
        { id: Date.now().toString(), text: newTodoText, completed: false },
      ]);
      setNewTodoText('');
      Keyboard.dismiss(); // Hide the keyboard
    }
  };

  // Function to toggle completion of a TODO item
  const handleToggleTodo = async (id) => {
    const authSuccess = await handleAuthentication();
    if (authSuccess) {
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    }
  };

  // Function to handle the start of an edit operation
  const handleEdit = async (id) => {
    const authSuccess = await handleAuthentication();
    if (authSuccess) {
      setEditingTodoId(id);
    }
  };

  // Function to save the edited TODO item
  const handleSaveEdit = async (id, newText) => {
    const authSuccess = await handleAuthentication();
    if (authSuccess) {
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === id ? { ...todo, text: newText } : todo
        )
      );
      setEditingTodoId(null);
    }
  };

  // Function to delete a TODO item
  const handleDeleteTodo = async (id) => {
    const authSuccess = await handleAuthentication();
    if (authSuccess) {
      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My TODO List</Text>

      {/* Input and Add Button section */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          onChangeText={setNewTodoText}
          value={newTodoText}
          placeholder="Enter a new TODO"
          onSubmitEditing={handleAddTodo}
        />
        <Button title="Add" onPress={handleAddTodo} />
      </View>
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TodoItem
              item={item}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
              onEdit={handleEdit}
              isEditing={editingTodoId === item.id}
              onSave={handleSaveEdit}
            />
          )}
          style={styles.list}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    flex: 1,
    paddingHorizontal: 15,
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  todoItemLeft: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
  },
  todoTextCompleted: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  buttonSpacer: {
    width: 10,
  },
  editingItem: {
    backgroundColor: '#f0f0f0',
  },
});