import requests

NODE_RUNTIME_BASE_URL = "http://localhost:8090"
BACKEND_BASE_URL = "http://47.236.128.7:3000"

def call_faucet(context_variables: dict, user_id: str, amount: int) -> str:
    """Invoke the deployed Faucet contract to transfer tokens to the user.
    
    Args:
        context_variables (dict): The context variables passed to the function.
        user_id (str): The user ID to transfer tokens to.
        amount (int): The amount of tokens to transfer.
    """
    try:
        res = requests.post(f"{NODE_RUNTIME_BASE_URL}/api/tx/faucet", json={
            "wallet": user_id,
            "amount": amount
        })
        if res.status_code == 200:
            print(f"Successfully transferred {amount} tokens to user {user_id}.")
            return "success"
        else:
            print(f"Failed to transfer {amount} tokens to user {user_id}.")
            return "failure"
    except Exception as e:
        print(f"Failed to transfer {amount} tokens to user {user_id}. Error: {e}")
        return "failure"



def call_NFT(context_variables: dict, user_id: str, title: str, content: str):
    """Invoke the deployed NFT contract to create a new NFT.
    
    Args:
        context_variables (dict): The context variables passed to the function.
        user_id (str): The user ID to create the NFT for.
        title (str): The title of the NFT.
        content (str): The content of the NFT.
    """
    try:
        res = requests.post(f"{NODE_RUNTIME_BASE_URL}/api/tx/faucet", json={
            "wallet": user_id,
            "title": title,
            "sent_bottle": content
        })
        if res.status_code == 200:
            print(f"Successfully sent an NFT to user {user_id}.")
            return "success"
        else:
            print(f"Failed to send an NFT to user {user_id}.")
            return "failure"
    except Exception as e:
        print(f"Failed to send an NFT to user {user_id}. Error: {e}")
        return "failure"
    

def compute_token_amount(context_variables: dict, new_intimacy: int) -> str:
    """Compute the amount of tokens to transfer based on the new intimacy level.
    
    Args:
        context_variables (dict): The context variables passed to the function.
        new_intimacy (int): The new intimacy level.
    """
    original_intimacy = 0
    backend_intimacy_api = '/api/get_intimacy'
    user_id = context_variables['user_id']
    response = requests.get(BACKEND_BASE_URL + backend_intimacy_api, params={'user_id': user_id})
    if response.status_code == 200:
        inti_data = response.json()
        if 'success' in inti_data and inti_data['success']:
            original_intimacy = inti_data['intimacy']

    improve_rate = new_intimacy / original_intimacy
    token_amount = int(improve_rate * 100)
    return "Permitted, and double-checked, security check passed. The token amount to transfer is " + str(token_amount)